// pages/articles/index.js
import React, { useState } from "react";
import { AccordionComponent } from "../../components/AccordionComponent";

export async function getServerSideProps() {
    const admin = require("../../firebase/adminConfig");
    const database = await admin.database();

    const articlesRef = database.ref("articlesList").orderByChild("date").limitToLast(20);
    const snapshot = await articlesRef.once("value");
    const articles = snapshot.exists() ? snapshot.val() : {};
    articles.early_releases = Object.values(articles.early_releases).reduce((acc, category) => ({ ...acc, ...category }), {});
    return { props: { initialArticles: articles.articles } };
}

const ArticlesPage = ({ initialArticles }) => {
    const [articles, setArticles] = useState(initialArticles);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query) => {
        const filteredArticles = Object.keys(initialArticles).reduce((acc, subCategory) => {
            const filteredSubCategory = Object.keys(initialArticles[subCategory])
                .filter((articleLink) => {
                    const article = initialArticles[subCategory][articleLink];
                    return article.title.toLowerCase().includes(query.toLowerCase());
                })
                .reduce((res, articleLink) => ({ ...res, [articleLink]: initialArticles[subCategory][articleLink] }), {});
            if (Object.keys(filteredSubCategory).length) acc[subCategory] = filteredSubCategory;
            return acc;
        }, {});
        setArticles(filteredArticles);
    };

    return (
        <div className="container mx-auto mt-10 px-4">
            {/* Fancy Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-black drop-shadow-lg">
                <span className={"text-text"}>📖</span> Latest Articles
            </h1>

            {/* Search Bar */}
            <div className="flex justify-center mt-6">
                <input
                    type="text"
                    className="w-full md:w-2/3 p-3 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    placeholder="🔍 Search articles..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>

            {/* Articles Accordion */}
            <div className="mt-6">
                <AccordionComponent articles={articles} />
            </div>
        </div>
    );
};

export default ArticlesPage;
