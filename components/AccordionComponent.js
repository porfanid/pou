import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function AccordionComponent({ articles }) {
    const [activeKey, setActiveKey] = useState(
        articles && Object.keys(articles).includes("earlyReleases")
            ? "earlyReleases"
            : "Collabs and Sponsorships"
    );

    const renderArticles = (articles, subCategory) => {
        return Object.keys(articles)
            .filter((article) => !!articles[article].title)
            .map((articlelink, index) => {
                const article = articles[articlelink];
                if (!article) return null;

                return (
                    <div className="w-full p-3" key={index}>
                        <div className="bg-gray-900 border border-red-700 shadow-lg shadow-red-900 rounded-xl p-5 transition duration-300 hover:scale-105">
                            {article.image && (
                                <Image
                                    width={800}
                                    height={500}
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-48 object-cover rounded-md mb-3 border border-red-800 shadow-md shadow-red-900"
                                />
                            )}
                            <h3 className="text-xl font-bold text-red-500 tracking-wider">{article.title}</h3>
                            <div className="mt-3">
                                <Link
                                    href={`/article${subCategory === "earlyReleases" ? "/early" : ""}/${articlelink}`}
                                    className="bg-red-700 text-white px-5 py-2 rounded-md font-semibold text-lg transition duration-300 hover:bg-red-900 shadow-md shadow-red-900"
                                >
                                    ⚡ Read More
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            });
    };

    const sortedKeys = articles ? Object.keys(articles).sort() : [];
    if (sortedKeys.includes("earlyReleases")) {
        sortedKeys.splice(sortedKeys.indexOf("earlyReleases"), 1);
        sortedKeys.unshift("earlyReleases");
    }

    return articles ? (
        <div className="flex flex-col md:flex-row bg-black text-gray-300 p-6 rounded-3xl border-2 border-red-800 shadow-lg shadow-red-900">
            {/* Sidebar Navigation */}
            <div className="md:w-1/4 hidden md:block">
                <nav className="sticky top-4">
                    <ul>
                        {sortedKeys.map((subCategory, subIndex) => (
                            <li key={subIndex} className="mb-2">
                                <button
                                    className={`w-full text-left px-4 py-2 rounded-md text-lg font-bold tracking-wider uppercase transition-all duration-300 ${
                                        activeKey === subCategory
                                            ? "bg-red-700 text-white shadow-lg shadow-red-900"
                                            : "hover:bg-red-800 hover:text-white"
                                    }`}
                                    onClick={() => setActiveKey(subCategory)}
                                >
                                    {subCategory}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Accordion Content */}
            <div className="md:w-3/4">
                {sortedKeys.map((subCategory, subIndex) => (
                    <div key={subIndex} className="mb-6">
                        <button
                            className="w-full text-left text-2xl font-extrabold uppercase bg-gray-800 px-5 py-3 rounded-md mb-3 border-2 border-red-700 tracking-widest shadow-md shadow-red-900 transition duration-300 hover:bg-red-800 hover:text-white"
                            onClick={() => setActiveKey(subCategory)}
                        >
                            🎸 {subCategory}
                        </button>
                        {activeKey === subCategory && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {renderArticles(articles[subCategory] || {}, subCategory)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <div className="text-red-500 text-2xl font-bold text-center py-10">🔥 Loading Metal Goodness...</div>
    );
}
