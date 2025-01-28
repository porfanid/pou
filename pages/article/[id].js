import Head from 'next/head';
import SocialShare from '../../components/SocialShare';
import Comments from '../../components/Comments';
import Image from "next/image";
import AuthorOfArticle from "../../components/pages/article/AuthorOfArticle";

export default function ArticlePage({ article, error }) {
    if (error) {
        return <p>{error}</p>;
    }

    if (!article) {
        return <p>Article not found</p>;
    }

    const { title, description, content, sub, date, img01, details, translatedBy } = article;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={img01} />
                <meta property="og:type" content="article" />
            </Head>
            <article className="max-w-7xl mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4 text-text-title">{title}</h1>
                <div className="text-gray-500 text-sm mb-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={"grid grid-cols-1"}>
                        <div className={"text-2xl text-center"}>
                        Author:
                        </div>
                        <div className="flex justify-center items-center">
                            <AuthorOfArticle author={sub}/>
                        </div>
                    </div>
                    {translatedBy&&
                        <div className={"grid grid-cols-1"}>
                            <div className={"text-2xl text-center"}>
                                Translator:
                            </div>
                            <div className="flex justify-center items-center">
                                <AuthorOfArticle author={sub}/>
                            </div>
                        </div>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                    <div>
                        <Image layout={"responsive"} width={800} height={500} src={img01} alt={title}
                               className="w-full object-cover rounded mb-4"/>
                        <p className="lead">
                        <span dangerouslySetInnerHTML={{__html: details}}></span>
                        </p>
                    </div>
                    <div className="relative p-4">
                        {/* Blurred Frame */}
                        <div className="absolute inset-0 bg-black opacity-25 rounded-lg backdrop-blur-lg z-10"/>
                        <div
                            className="prose max-w-none relative z-20"
                            dangerouslySetInnerHTML={{__html: content}}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <SocialShare title={title}/>
                    </div>
                    <div>
                        <Comments articleId={article.id}/>
                    </div>
                </div>
            </article>
        </>
    );
}

async function getAuthor(authorCode, bucket, database){
    const author = await database.ref(`authors/${authorCode}`).once('value');
    if (author.exists()) {
        const authorData = author.val();
        const imageRef = bucket.file(`/profile_images/${authorCode}_600x600`);
        try {
            authorData.photoURL = await imageRef.getDownloadURL();
        } catch (e) {
            authorData.wantToShow = false;
        }
        return { ...authorData, code: authorCode };
    }
    return authorCode;
}

// Server-side rendering to fetch article data
export async function getServerSideProps(context) {
    const { id } = context.params;

    const admin = require('../../firebase/adminConfig');

    try {
        // Ensure admin SDK is available only on the server
        if (!admin) {
            return { notFound: true }; // Admin SDK shouldn't run on client
        }

        const bucket = (await admin.storage()).bucket();
        const database = (await admin.database());

        // Define the path to the article JSON file in Firebase Storage
        const articlePath = `articles/${id}.json`;

        // Reference the file from the Firebase Storage bucket
        const file = bucket.file(articlePath);

        // Download the file content as a string
        const [fileContent] = await file.download();

        // Parse the content as JSON
        const article = JSON.parse(fileContent.toString('utf8'));


        const authorCode = article.sub;
        article.sub = await getAuthor(authorCode, bucket, database);

        if(article.translatedBy){
            const translatorCode = article.translatedBy;
            article.translatedBy = await getAuthor(translatorCode, bucket, database);
        }

        if (!article) {
            return { notFound: true }; // Trigger 404 if the article doesn't exist
        }

        return {
            props: { article },
        };
    } catch (error) {
        console.error("Error fetching article:", error.message);
        return { props: { error: `Failed to load the article: ${error.message}` } };
    }
}
