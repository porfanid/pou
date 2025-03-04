import Head from 'next/head';
import SocialBar from '../../components/SocialShare';
import Comments from '../../components/Comments';
import Image from "next/image";
import AuthorOfArticle from "../../components/pages/article/AuthorOfArticle";
import { FaFacebook, FaSpotify, FaInstagram, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

export default function ArticlePage({ article, error }) {
    if (error) {
        return <p>{error}</p>;
    }

    if (!article) {
        return <p>Article not found</p>;
    }

    const { title, description, content, sub, img01, details, translatedBy, socials, id } = article;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={encodeURI(img01)} />
                <meta property="og:type" content="article" />
            </Head>
            <article className="max-w-7xl mx-auto p-4">
                <h1 className="mt-10 mb-10 text-4xl md:text-5xl font-extrabold text-transparent bg-gradient-to-r from-titleStart to-titleRed bg-clip-text text-center animate-gradient-animation">
                    {title}
                </h1>

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
                    <div>
                        <Image layout="responsive" width={800} height={500} src={img01} alt={title}
                               className="w-full object-cover rounded mb-4" />
                        <p className="lead">
                            <span dangerouslySetInnerHTML={{ __html: details }}></span>
                        </p>
                    </div>
                    <div className="relative p-4">
                        {/* Blurred Frame */}
                        <div className="absolute inset-0 bg-gray-500 opacity-25 rounded-lg backdrop-blur-lg z-10" />
                        <div
                            className="prose max-w-none relative z-20 break-words break-all overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: content }}
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
            `}</style>
        </>
    );
}



async function getAuthor(authorCode, bucket, database) {
    const author = await database.ref(`authors/${authorCode}`).once('value');
    if (author.exists()) {
        const authorData = author.val();
        const imageRef = bucket.file(`/profile_images/${authorCode}_600x600`);
        try {
            authorData.photoURL = await imageRef.getDownloadURL();
        } catch (e) {
            authorData.wantToShow = false;
        }
        return {...authorData, code: authorCode};
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
        const bucket = await admin.storage();
        const database = await admin.database();

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
        return { props: { error: `Failed to load the article: ${error.message}` } };
    }
}