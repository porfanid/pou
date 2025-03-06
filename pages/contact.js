import React from "react";
import { FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import logo from "../components/navigation/PulseOfTheUnderground_800x800.jpg"; // Change this to your logo

import reddit_gif from "../components/social_icons/./redit_100x100.gif"
import facebook_gif from "../components/social_icons/Facebook_100x100.gif"
import instagram_gif from "../components/social_icons/Instagram_100x100.gif"
import youtube_gif from "../components/social_icons/Youtube_100x100.gif"

const ContactPage = () => {
    return (
        <div className="text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
            {/* Glitching Metal Title */}
            <h1 className="text-5xl font-bold mb-4 text-text-bold old-english-font">
                Get in Touch with Us
            </h1>
            <p className="text-center text-xl sm:text-2xl mb-6">
            Let&#39;s Raise Hell Together! Connect with us through the following channels.
            </p>

            {/* Contact Info Section */}
            <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                <div className="flex flex-wrap justify-center space-x-8">
                    {/* Email Icon */}
                    <div className="flex items-center space-x-2 text-xl sm:text-2xl">
                        <FaEnvelope className="flame-effect" />
                        <a href="mailto:contact@pulseunderground.com" className="hover:text-red-600 transition duration-300">
                            contact@pulseunderground.com
                        </a>
                    </div>
                    {/* Social Media Icons */}
                    <div className="flex space-x-6">
                        <a
                            href="https://web.facebook.com/pulseoftheunderground/"
                            className="flame-effect hover:text-blue-600 transition duration-300"
                        >
                            <Image alt={"Facebook"} src={facebook_gif} width={50} height={50} />
                        </a>
                        <a
                            href="https://www.instagram.com/pulse_of_the_underground/"
                            className="flame-effect hover:text-pink-600 transition duration-300"
                        >
                            <Image alt={"Instagram"} src={instagram_gif} width={50} height={50} />
                        </a>
                        <a
                            href="https://www.youtube.com/@PulseoftheUndergoundWebzine"
                            className="flame-effect hover:text-blue-400 transition duration-300"
                        >
                            <Image alt={"Youtube"} src={youtube_gif} width={50} height={50} />
                        </a>
                        <a
                            href="https://www.reddit.com/r/heavy_local_magazine/"
                            className="flame-effect hover:text-orange-500-500 transition duration-300"
                        >
                            <Image alt={"reddit"} src={reddit_gif} width={50} height={50} />
                        </a>
                    </div>
                </div>

                {/* "Talk to Us on Facebook" Button */}
                <div className="mt-8">
                    <a
                        href="https://m.me/yourpage"
                        className="animate-flame text-white text-2xl font-bold px-6 py-3 rounded-full transition duration-300 transform hover:scale-105"
                    >
                        Talk to Us on Facebook
                    </a>
                </div>

                {/* Logo Animation */}
                <div className="mt-12 animate-fire relative">
                    <Image
                        src={logo.src}
                        alt="Pulse of the Underground Logo"
                        width={250}
                        height={250}
                        className="sm:w-[300px] sm:h-[300px] drop-shadow-xl opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 mix-blend-overlay animate-sweep"></div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
