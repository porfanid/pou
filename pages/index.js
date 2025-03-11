import React, {useState} from "react";
import Link from "next/link";

import Angels from '../components/Banners/Angels-removebg-preview.png';
import Artizans from '../components/Banners/artisans-removebg-preview.png';
import Kingdom from '../components/Banners/MyKingdomMusic-removebg-preview.png';
import Atomic from '../components/Banners/logo_atomic_stuff.png';
import Image from "next/image";
import PrimaryCarousel from "../components/pages/index/carousel/carousel";
import facebook_gif from "../components/social_icons/Facebook_100x100.gif";
import instagram_gif from "../components/social_icons/Instagram_100x100.gif";
import youtube_gif from "../components/social_icons/Youtube_100x100.gif";
import reddit_gif from "../components/social_icons/redit_100x100.gif";


const Socials = ({dimensions}) => {

    return (
        <div className="flex flex-wrap justify-center lg:flex-col items-center gap-4">
            <a
                href="https://web.facebook.com/pulseoftheunderground/"
                className="flame-effect hover:text-blue-600 transition duration-300"
            >
                <Image alt={"Facebook"} src={facebook_gif} width={dimensions} height={dimensions}/>
            </a>
            <a
                href="https://www.instagram.com/pulse_of_the_underground/"
                className="flame-effect hover:text-pink-600 transition duration-300"
            >
                <Image alt={"Instagram"} src={instagram_gif} width={dimensions} height={dimensions}/>
            </a>
            <a
                href="https://www.youtube.com/@PulseoftheUndergoundWebzine"
                className="flame-effect hover:text-blue-400 transition duration-300"
            >
                <Image alt={"Youtube"} src={youtube_gif} width={dimensions} height={dimensions}/>
            </a>
            <a
                href="https://www.reddit.com/r/heavy_local_magazine/"
                className="flame-effect hover:text-orange-500-500 transition duration-300"
            >
                <Image alt={"reddit"} src={reddit_gif} width={dimensions} height={dimensions}/>
            </a>
        </div>
    );
};


const HeroSection = () => {
    return (
        <section className="relative text-white pt-20 sm:pt-10 lg:pt-35 pb-16 sm:pb-10 lg:pb-32 px-4 sm:px-6">
            <div className="absolute inset-0 bg-cover bg-center opacity-60"
                 style={{backgroundImage: "url('https://your-image-url.com/background.jpg')"}}></div>

            <div className="relative container mx-auto text-center">
                <h1 className="old-english-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-tight text-shadow-md text-text-bold break-words mb-5">
                    Pulse of the Underground
                </h1>
                <p className="text-lg mb-6 max-w-xl mx-auto mt-5">
                    The latest metal news, reviews, and underground hits. Stay tuned for the newest articles, playlists,
                    and more!
                </p>

                <div className="flex flex-col lg:flex-row items-center justify-evenly gap-6">
                    <div>
                        <iframe
                            src="https://open.spotify.com/embed/playlist/6QrzcuTVOFxrgnQObOyT6q?utm_source=generator"
                            height="380"
                            allow="encrypted-media"
                            className="max-w-full rounded-lg shadow-2xl"
                        ></iframe>
                    </div>
                    <Socials dimensions={80}/>
                </div>

                <Link href="#latest-articles"
                      className="bg-red-600 text-white px-6 py-3 text-lg font-semibold rounded-full shadow-lg transition duration-300 hover:bg-red-700 mt-6 inline-block">
                    Explore Latest Articles
                </Link>
            </div>
        </section>
    );
};


// This function runs server-side to fetch the articles
export async function getServerSideProps() {
    const admin = require('../firebase/adminConfig');
    const database = await admin.database();

    let allArticles = [];
    let categories = ['All'];

    try {
        const snapshot = database.ref('/articlesListLatest/articles');
        const snapshotData = await snapshot.once('value');
        const data = snapshotData.val();

        if (data) {
            Object.keys(data).forEach(category => {
                categories.push(category);
                Object.keys(data[category]).forEach(articleKey => {
                    allArticles.push({...data[category][articleKey], category, link: articleKey});
                });
            });
        }
    } catch (error) {
        console.error("Error fetching articles:", error);
        allArticles = [];
        categories = [];
    }

    let images = [];
    let fullImages = [];

    return {props: {articles: allArticles, categories, images, fullImages}};
}


const SponsorBanner = () => (
    <div className="py-8">
        <div className="container mx-auto text-center px-4 overflow-hidden">
            <h3 className="text-3xl font-bold text-gray-300 mb-6">Collaborators and Friendly Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[Angels, Artizans, Kingdom, Atomic].map((src, index) => (
                    <div key={index}
                         className="flex justify-center items-center bg-gray-800 rounded-lg p-4 transition-transform transform hover:scale-105 overflow-hidden w-full">
                        <Image
                            width={src.width}
                            height={src.height}
                            alt={src.src}
                            src={src.src}
                            className="opacity-90 transition-opacity hover:opacity-100 max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-auto"
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const TopNews = ({articles, categories}) => {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const handleCategoryChange = (category) => setSelectedCategory(category);

    const groupedArticles = articles.reduce((acc, article) => {
        if (!acc[article.category]) {
            acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
    }, {});

    console.log(articles[0])

    const filteredArticles =
        selectedCategory === "All" ? articles : articles.filter((article) => article.category === selectedCategory);

    return (
        <div id="latest-articles" className="mt-10 container mx-auto rounded-lg text-white p-6">
            <hr className="bg-white my-6"/>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
                <h1 className="text-4xl font-bold text-gray-300 tracking-tight text-center sm:text-left">
                    Latest Articles
                </h1>
                <Link href="/article"
                      className="btn bg-gray-700 text-white hover:bg-gray-600 rounded-lg px-4 py-2 font-semibold transition self-center sm:self-start">
                    Explore More
                </Link>
            </div>
            <div className="flex flex-wrap mb-6 gap-4 justify-center sm:justify-start">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`btn text-lg px-6 py-2 rounded-full transition-all ${
                            selectedCategory === category
                                ? "bg-gray-700 text-white"
                                : "bg-transparent border-2 border-gray-500 text-gray-500"
                        } hover:bg-gray-600 hover:text-white`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div>
                {filteredArticles.length > 0 ? (
                    Object.keys(groupedArticles).map((category) => (
                        <div key={category} className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-300 mb-4">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {groupedArticles[category].map((article, index) => (
                                    <div key={index}
                                         className="bg-[#150000] rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
                                        <img
                                            src={article.img01}
                                            className="w-full h-64 object-cover"
                                            alt={article.title}
                                        />
                                        <div className="p-4">
                                            <h5 className="text-xl text-gray-600 font-bold">{article.title}</h5>
                                        </div>
                                        <div className="flex justify-center pb-4">
                                            <Link
                                                className="btn bg-gray-600 text-white hover:bg-gray-500 py-2 px-6 rounded-lg transition"
                                                href={`/article/${article.link}`}>
                                                Read More
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-xl font-semibold">No articles available</p>
                )}
            </div>
        </div>
    );
};


const HomePage = ({articles, categories, images, fullImages}) => {
    console.log(images)
    return (
        <div className={"max-w-full"}>
            <HeroSection/>
            <TopNews articles={articles} categories={categories}/>
            <SponsorBanner/>
            {images&&fullImages&&<PrimaryCarousel fullImages={fullImages} images={images}/>}
            {/* Other sections will be added here */}
        </div>
    );
};

export default HomePage;
