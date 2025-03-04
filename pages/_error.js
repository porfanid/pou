// File: pages/_error.js
import Head from 'next/head';
import React from "react";

function Error({ statusCode }) {
    return (
        <>
            <style jsx>{`
            .error-page {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #fff;
                font-family: 'Metal Mania', sans-serif;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .content {
                z-index: 10;
                padding: 2rem;
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(255, 0, 0, 0.8);
            }

            .error-title {
                font-size: 8rem;
                color: crimson;
                text-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
            }

            .error-message {
                font-size: 2rem;
                margin: 20px 0;
                color: #f8f8f8;
            }

            .back-button {
                padding: 0.8rem 2rem;
                background-color: crimson;
                color: #fff;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                transition: background-color 0.3s;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .back-button:hover {
                background-color: red;
            }

            /* Background effects (metal vibes) */
            .error-page::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: url('https://example.com/metal-background.jpg') no-repeat center center;
                background-size: cover;
                filter: blur(10px);
                z-index: 1;
            }
        `}</style>
            <Head>
                <title>{statusCode ? `Error ${statusCode}` : 'Error'} - Pulse Of The Underground</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon.io/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.io/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon.io/favicon-16x16.png"/>
                <link rel="icon" href="/favicon.ico"/>
                <link rel="manifest" href="/favicon.io/site.webmanifest"/>
            </Head>
            <div className="error-page">
                <div className="content">
                    <h1 className="error-title">{statusCode}</h1>
                    <p className="error-message">Something went terribly wrong on the server...</p>
                    <button onClick={() => router.push('/')} className="back-button">Back to Home</button>
                </div>
            </div>
        </>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;