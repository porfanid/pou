import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import NotFoundPage from "./404";
import ErrorLayout from "../components/errorLayout";

const ServerErrorPage = () => {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>500 - Server Crashed</title>
                <link href="https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap" rel="stylesheet"/>
            </Head>
            <div className="error-page">
                <div className="content">
                    <h1 className="error-title">500</h1>
                    <p className="error-message">Something went terribly wrong on the server...</p>
                    <button onClick={() => router.push('/')} className="back-button">Back to Home</button>
                </div>
            </div>

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
        </>
    );
};

ServerErrorPage.getLayout = ErrorLayout;

export default ServerErrorPage;
