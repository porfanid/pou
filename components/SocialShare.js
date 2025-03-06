import React, { useEffect, useState } from "react";
import {
    FacebookShareButton, TwitterShareButton, LinkedinShareButton,
    WhatsappShareButton, TelegramShareButton, RedditShareButton
} from "react-share";

import { FaFacebook, FaXTwitter, FaLinkedin, FaWhatsapp, FaTelegram, FaReddit } from "react-icons/fa6";
import { useRouter } from "next/router";

const SocialBar = ({ articleTitle }) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState("");

    useEffect(() => {
        const hostname = "https://pulse-of-the-underground.com";
        const fullUrl = `${hostname}${router.asPath}`;
        console.log("Current Page URL:", fullUrl);  // Debugging URL
        setCurrentPage(fullUrl);
    }, [router.asPath]);

    // Share message
    const fancyShareMessage = `🔥 Check out this epic article: "${articleTitle}" 🔥\n
    🤘 If you're a true metalhead, this is a must-read! 🤘\n\n`;

    const shareMessage = `🔥 Check out this epic article: "${articleTitle}" 🔥\n
     If you're a true metalhead, this is a must-read! \n\n`;

    // Hashtags (for platforms that support them)
    const hashtags = ["#Metal", "#HeavyMetal", "#Rock", "#Music"];

    return (
        <div className="social-bar flex flex-col items-center justify-center p-4 bg-black text-white border border-red-700 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-red-500 gothic-font">Share this article</h3>

            <div className="flex gap-4">
                {currentPage && (
                    <>
                        <FacebookShareButton url={currentPage} quote={shareMessage} hashtag={hashtags}>
                            <FaFacebook className="text-3xl text-blue-600 transition-transform transform hover:scale-110" />
                        </FacebookShareButton>

                        <TwitterShareButton url={currentPage} title={shareMessage} hashtags={hashtags.map(tag => tag.slice(1))}>
                            <FaXTwitter className="text-3xl text-gray-300 transition-transform transform hover:scale-110" />
                        </TwitterShareButton>

                        <LinkedinShareButton url={currentPage} title={articleTitle} summary={shareMessage} source={currentPage}>
                            <FaLinkedin className="text-3xl text-blue-500 transition-transform transform hover:scale-110" />
                        </LinkedinShareButton>

                        <WhatsappShareButton url={currentPage} title={shareMessage}>
                            <FaWhatsapp className="text-3xl text-green-500 transition-transform transform hover:scale-110" />
                        </WhatsappShareButton>

                        <TelegramShareButton url={currentPage} title={shareMessage}>
                            <FaTelegram className="text-3xl text-blue-400 transition-transform transform hover:scale-110" />
                        </TelegramShareButton>

                        <RedditShareButton url={currentPage} title={articleTitle}>
                            <FaReddit className="text-3xl text-orange-500 transition-transform transform hover:scale-110" />
                        </RedditShareButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default SocialBar;
