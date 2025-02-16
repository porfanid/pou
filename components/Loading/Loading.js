"use client";

import { useEffect, useState } from "react";
import logo from "../PulseOfTheUnderground_800x800.jpg";
import skull_svg from "./Skull_and_Crossbones.svg";

const Skull=()=> {
    return (
        <img src={skull_svg.src} alt="Skull" className="w-full h-full object-contain brightness-200 backdrop-brightness-200"/>
    );
}

export default function Loading() {
    const [screenWidth, setScreenWidth] = useState(768); // Default for SSR

    useEffect(() => {
        // Update width on mount (client-side)
        const handleResize = () => setScreenWidth(window.innerWidth);
        handleResize(); // Set initial value
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="loading-container flex flex-col justify-center items-center h-screen bg-black relative overflow-hidden p-4">
            {/* Pulsing background effect */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 animate-pulse bg-red-900 opacity-10 blur-3xl"></div>
            </div>

            {/* Metal-style chains overlay */}
            <div className="absolute inset-0 bg-[url('/chains_overlay.png')] bg-repeat opacity-20"></div>

            {/* Glitching skull flickers */}
            <div
                className='absolute w-20 h-20 sm:w-32 sm:h-32 opacity-100 animate-glitch top-5 left-5 sm:top-10 sm:left-10 mix-blend-overlay'>
                <Skull/>
            </div>
            <div
                className='absolute w-20 h-20 sm:w-32 sm:h-32 opacity-100 animate-glitch bottom-5 right-5 sm:bottom-10 sm:right-10 mix-blend-overlay'>
                <Skull/>
            </div>
            <div
                className='absolute w-20 h-20 sm:w-32 sm:h-32 opacity-100 animate-glitch top-5 right-5 sm:top-10 sm:right-10 mix-blend-overlay'>
                <Skull/>
            </div>
            <div
                className='absolute w-20 h-20 sm:w-32 sm:h-32 opacity-100 animate-glitch bottom-5 left-5 sm:bottom-10 sm:left-10 mix-blend-overlay'>
                <Skull/>
            </div>

            {/* Logo with metallic shine effect */}
            <div
                className="relative animate-fire animate-glitch bg-gradient-to-r from-transparent via-white to-transparent opacity-10 mix-blend-overlay ">
                <img src={logo.src} alt="Pulse of the Underground Logo" width={250} height={250}
                     className="sm:w-[300px] sm:h-[300px] drop-shadow-xl"/>
                <div className="absolute inset-0 animate-sweep"></div>
            </div>

            {/* Soundwave animation (scales with screen size) */}
            <div className="mt-6 flex gap-1 mb-6 sm:mt-8 sm:mb-8">
                {[...Array(screenWidth > 768 ? 8 : 5)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2 sm:w-3 bg-red-600 animate-soundwave"
                        style={{height: `${Math.random() * 50 + 30}px`, animationDelay: `${i * 0.2}s`}}
                    />
                ))}
            </div>
        </div>
    );
}