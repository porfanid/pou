import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Youtube = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Make a GET request to the Next.js API route
                const response = await fetch('/api/getYoutubeVideos');
                const data = await response.json();

                // Set the videos data
                setVideos(data.items);
            } catch (error) {
                console.error('Error Fetching Videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData().then();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                <div className="text-center">
                    <div className="spinner-border animate-spin border-4 border-t-4 border-red-600 rounded-full w-16 h-16 mb-6" />
                    <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider">Loading...</h2>
                </div>
            </div>
        );
    }

    const decodeHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.documentElement.textContent || doc.body.textContent;
    };

    return (
        <div className="container mx-auto mt-5 px-4">
            <h1 className="text-4xl font-extrabold text-white text-center mb-8 tracking-widest uppercase drop-shadow-lg">YouTube Channel Videos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {videos.map((video) => video.id.videoId && (
                    <div className="card bg-gray-900 text-white border-0 shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all" key={video.id.videoId}>
                        <Image width={800} height={800} className="card-img-top w-full h-64 object-cover" src={video.snippet.thumbnails.high.url} alt="Thumbnail"/>
                        <div className="card-body p-4">
                            <h5 className="text-2xl font-bold text-red-600 mb-2">
                                {decodeHtml(video.snippet.title)}
                            </h5>
                            <p className="text-sm mb-4">{video.snippet.description}</p>
                            <Link href={`https://www.youtube.com/watch?v=${video.id.videoId}`} className="btn bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors" target="_blank" rel="noopener noreferrer">Watch Video</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Youtube;
