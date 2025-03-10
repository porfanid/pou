import * as admin from "../firebase/adminConfig";
import RSS from "rss";

export async function getServerSideProps({ res, query }) {
    const db = await admin.database();
    const category = query.category || null;
    let latestArticleDate = null;

    try {
        // Fetch author and users
        const authorsSnapshot = await db.ref("authors").once("value");
        const usersSnapshot = await db.ref("users").once("value");
        const allAuthors = { ...authorsSnapshot.val(), ...usersSnapshot.val() };

        // Fetch articles
        const articlesSnapshot = await db.ref("articlesList/articles").once("value");
        const articles = articlesSnapshot.val();
        let articlesArray = [];

        if (category && articles[category]) {
            articlesArray = Object.entries(articles[category]).map(([key, value]) => ({ key, ...value }));
        } else {
            for (const [cat, articlesInCategory] of Object.entries(articles)) {
                articlesArray = articlesArray.concat(
                    Object.entries(articlesInCategory).map(([key, value]) => ({ category: cat, key, ...value }))
                );
            }
        }

        // Sort articles by date (newest first)
        articlesArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get latest articles date
        if (articlesArray.length > 0) {
            latestArticleDate = new Date(articlesArray[0].date);
        }

        // Create RSS feed
        const feed = new RSS({
            title: "Pulse Of The Underground",
            description: "An active news website for underground metal bands",
            feed_url: "https://pulse-of-the-underground.com/feed",
            site_url: "https://pulse-of-the-underground.com/",
            image_url: "https://pulse-of-the-underground.com/assets/PulseOfTheUnderground.jpg",
            managingEditor: "admin@pulse-of-the-underground.com (Pulse Of The Underground)",
            webMaster: "admin@pulse-of-the-underground.com (Pulse Of The Underground)",
            pubDate: latestArticleDate ? latestArticleDate.toUTCString() : new Date().toUTCString(),
        });

        // Add articles to RSS feed
        articlesArray.forEach((article) => {
            feed.item({
                title: article.title,
                description: article.content
                    ? article.content.replace("/assets", "https://pulse-of-the-underground.com/assets")
                    : "",
                url: `https://pulse-of-the-underground.com/article/${article.key.replaceAll(".json", "")}`,
                author: allAuthors[article.author]?.displayName || "Unknown",
                date: new Date(article.date),
                enclosure: { url: article.image },
                categories: category ? [category] : [],
            });
        });

        // Return RSS feed as XML
        res.setHeader("Content-Type", "application/rss+xml");
        res.write(feed.xml({ indent: true }));
        res.end();
        return { props: {} }; // Prevents Next.js from rendering a page
    } catch (error) {
        console.error("Error generating RSS feed:", error);
        res.statusCode = 500;
        res.end("Failed to generate RSS feed"+ error);
        return { props: {} };
    }
}

export default function FeedPage() {
    return null; // This page should never render in the browser
}
