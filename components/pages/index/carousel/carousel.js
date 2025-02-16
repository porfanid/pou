"use client";
import React, { useState } from "react";

const PrimaryCarousel = ({ customSettings, images, fullImages }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const settings = {
        autoPlay: true,
        interval: 4000,
        pauseOnHover: true,
        ...customSettings,
    };

    const handleImageClick = (index) => {
        setSelectedImage(fullImages[index]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {images.length > 0 && (
                <div className="relative overflow-hidden">
                    <div className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="w-full flex-shrink-0 snap-center"
                                onClick={() => handleImageClick(index)}
                            >
                                <img
                                    src={image}
                                    alt={`slide${index}`}
                                    className="w-full h-auto object-cover cursor-pointer transition-transform hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                            onClick={handleCloseModal}
                        >
                            ✖
                        </button>
                        <div className="text-center">
                            <img
                                src={selectedImage}
                                alt="Selected"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrimaryCarousel;
