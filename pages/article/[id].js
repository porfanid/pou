import SocialBar from '../../components/SocialShare';
import Comments from '../../components/Comments';
import Image from "next/image";
import AuthorOfArticle from "../../components/pages/article/AuthorOfArticle";
import { FaFacebook, FaSpotify, FaInstagram, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';
import {getServerSidePropsGeneric} from "../../components/pages/article/getData";

export default function ArticlePage({ article, error, metatags }) {
    if (error) {
        return <p>{error}</p>;
    }

    if (!article) {
        return <p>Article not found</p>;
    }

    const { title, description, content, sub, img01, details, translatedBy, socials, id } = article;
    console.log("img01",img01);
    return (
        <>
            <article className="max-w-7xl mx-auto p-4">
                <h2 className="mt-10 mb-10 text-xl md:text-5xl font-extrabold text-transparent bg-gradient-to-r from-titleStart to-titleRed bg-clip-text text-center animate-gradient-animation break-words">
                    {title}
                </h2>

                {/* Author Section */}
                <div className="max-w-[50%]">
                    <div className="text-gray-500 text-sm mb-4 grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div>
                            <div>Author:</div>
                            <div>
                                <AuthorOfArticle className="animate-bounceOnce" author={sub} />
                            </div>
                        </div>
                        {translatedBy && (
                            <div>
                                <div>Translator:</div>
                                <div>
                                    <AuthorOfArticle className="animate-bounceOnce" author={translatedBy} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="mt-2 mb-10 border-gray-400" />
                {/* Metal Themed Band Social Media Section */}
                {socials&&<div className="flex flex-col items-center text-center my-10">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-300">Follow the Band</h2>
                    <div className="flex gap-6 mt-4">
                        {socials.facebook &&
                            <a href={socials.facebook} target="_blank" rel="noopener noreferrer"
                               className="social-icon bg-[#3b5998] hover:bg-[#2d4373]">
                                <FaFacebook className="w-8 h-8"/>
                            </a>}
                        {socials.spotify &&
                            <a href={socials.spotify} target="_blank" rel="noopener noreferrer"
                               className="social-icon bg-[#1DB954] hover:bg-[#1aa34a]">
                                <FaSpotify className="w-8 h-8"/>
                            </a>}
                        {socials.instagram &&
                            <a href={socials.instagram} target="_blank" rel="noopener noreferrer"
                               className="social-icon bg-[#E4405F] hover:bg-[#c13584]">
                                <FaInstagram className="w-8 h-8"/>
                            </a>}
                        {socials.spotify &&
                            <a href={socials.spotify} target="_blank" rel="noopener noreferrer"
                               className="social-icon bg-[#FF0000] hover:bg-[#cc0000]">
                                <FaYoutube className="w-8 h-8"/>
                            </a>}
                    </div>
                </div>}

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 mb-4">
                    <div className="relative w-full h-0 pb-[62.5%] mb-4">
                        <Image layout="fill" objectFit="cover" src={img01} alt={title} className="rounded" />
                        <p className="lead mt-4">
                            <span dangerouslySetInnerHTML={{ __html: details }}></span>
                        </p>
                    </div>
                    <div className="relative p-4">
                        {/* Blurred Frame */}
                        <div className="absolute inset-0 bg-gray-500 opacity-25 rounded-lg backdrop-blur-lg z-10" />
                        <div
                            className="prose max-w-none relative z-20 overflow-hidden text-white"
                            dangerouslySetInnerHTML={{ __html: content }}
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-all', textAlign: 'justify' }}
                        />

                    </div>
                    <div className={"relative p-4 w-fit"}>
                        {article.translations && (
                            <div className="bg-black p-5 rounded-lg text-center border-2 border-red-800 shadow-red-600 shadow-md mt-5">
                                <h3 className="font-metal text-red-600 text-xl md:text-2xl tracking-widest drop-shadow-lg w-full">
                                    ⚡ Available Translations ⚡
                                </h3>
                                <ul className="list-none p-0 mt-4 space-y-3">
                                    {Object.entries(article.translations).map(([lang, file]) => (
                                        <li key={lang}>
                                            <Link href={`/articles/${file}`} legacyBehavior>
                                                <a className="inline-block px-6 py-3 bg-gradient-to-r from-red-900 to-black text-white font-bold font-metal uppercase border-2 border-red-600 shadow-md shadow-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500 hover:scale-105">
                                                    🤘 {lang.toUpperCase()} 🤘
                                                </a>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}


                    </div>
                </div>

                {/* Social Share and Comments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <SocialBar articleTitle={title} />
                    </div>
                    <div>
                        <Comments articleName={id} />
                    </div>
                </div>
            </article>

            {/* Custom Styles for Social Media Buttons */}
            <style jsx>{`
                .social-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    color: white;
                    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }

                .social-icon:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
                }

                .prose a {
                    word-break: break-word;
                }
            `}</style>
        </>
    );
}




// Server-side rendering to fetch articles data


export async function getServerSideProps(context) {
    const admin = require('../../firebase/adminConfig');
    return await getServerSidePropsGeneric(context, false, admin);
}