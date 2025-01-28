import React from 'react';
import {FacebookShareButton} from 'react-share';


const SocialBar = () => {

    const CurrentPage = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="social-bar">
            <FacebookShareButton url={CurrentPage}>
                Share To Facebook
            </FacebookShareButton>
        </div>
    );
};

export default SocialBar;