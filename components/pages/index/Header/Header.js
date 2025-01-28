import React, {useEffect, useState} from "react";
import PrimaryCarousel from "../carousel/carousel";
import Socials from "../SocialMedia/socials";
//import {useTranslation} from "react-i18next";
import "./Animation.css";
import './Header.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.pageYOffset > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`header-container mb-5 ${scrolled ? "scrolled" : ""}`}>
            <div className="carousel-container">
                <PrimaryCarousel />
                <div className="carousel-overlay">
                    <div className="text-container">
                        <h1 className="fancy-text">
                            <span className="small m-0">Welcome to</span>
                            <br />
                            <span className="font-1 fancy-text">Pulse Of The Underground</span>
                        </h1>
                        <div className="container">
                            <hr className="bg-white" />
                            <div className="socials">
                                <Socials />
                            </div>
                            <hr className="bg-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;