// pages/gallery/upload.js
import React, {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, database, storage } from "../../firebase/config";
import { push, ref, update } from 'firebase/database';
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { getIdTokenResult } from "firebase/auth";
import {useDropzone} from "react-dropzone";
import {useAuth} from "../../context/AuthContext";


export default function UploadGalleryItem() {
    const [descriptionEl, setDescriptionEl] = useState('');
    const [descriptionEng, setDescriptionEng] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const {user} = useAuth();

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setImage(acceptedFiles[0]);
        }
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: "image/*",
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!user) {
            setError("You must be logged in to upload items.");
            setSuccess('');
            return;
        }

        if (!image) {
            setError("Please select an image to upload.");
            setSuccess('');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        try {
            let userFolder ='users';

            const userRef = ref(database, `${userFolder}/${user.uid}`);

            await update(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL || ''
            });

            const imageRef = storageRef(storage, `images/gallery/${image.name}`);
            const uploadResult = await uploadBytes(imageRef, image);

            console.log(uploadResult);

            const newItem = {
                image: `/assets/gallery/${image.name}`,
                title: user.uid,
                descriptionEl,
                descriptionEng
            };

            await push(ref(database, 'gallery/review'), newItem);
            setDescriptionEl('');
            setDescriptionEng('');
            setImage(null);
            setSuccess("Upload successful! Your artwork will be reviewed by an admin.");
        } catch (error) {
            console.error("Error uploading data: ", error);
            setError("Error uploading data. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-red-600 text-center mb-6">
                        Upload Artwork
                    </h1>
                    <div className="w-full h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 mb-10"></div>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/50 border border-green-700 text-green-100 px-4 py-3 rounded mb-6">
                        {success}
                    </div>
                )}

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 shadow-lg">
                    <div className="mb-6">
                        <div {...getRootProps()}
                             className={`mt-4 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${isDragActive ? "border-red-500 bg-red-800" : "border-red-600 bg-gray-900"}`}>
                            <input {...getInputProps()} />
                            {image ? (
                                <div className="flex flex-col items-center">
                                    <img src={URL.createObjectURL(image)} alt="Preview" className="h-24 w-auto rounded-lg"/>
                                    <p className="mt-2 text-red-300 font-semibold">{image.name}</p>
                                </div>
                            ) : (
                                <p className="text-red-400 text-lg">Drag & Drop an image or <span
                                    className="text-red-500 underline">Click to Browse</span></p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-red-400 font-medium mb-2">
                            Description (Greek)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-200"
                            rows="3"
                            placeholder="Enter description in Greek"
                            value={descriptionEl}
                            onChange={(e) => setDescriptionEl(e.target.value)}
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-red-400 font-medium mb-2">
                            Description (English)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-200"
                            rows="3"
                            placeholder="Enter description in English"
                            value={descriptionEng}
                            onChange={(e) => setDescriptionEng(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <button
                            className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wider transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading
                                </span>
                            ) : 'Upload'}
                        </button>

                        <Link
                            href="/gallery"
                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-wider transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg rounded text-center"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}