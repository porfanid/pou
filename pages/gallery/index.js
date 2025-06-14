// pages/gallery/index.js
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { database, storage } from "../../firebase/config";
import { child, get, push, ref, remove, update, onValue } from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";

export default function ArtGallery() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [reviewItems, setReviewItems] = useState([]);
    const [isGalleryAdmin, setIsGalleryAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const {roles } = useAuth();

    const getUserData = async (username) => {
        const displayNameRef = ref(database, `users/${username}/displayName`);
        const wantToShowRef = ref(database, `users/${username}/wantToShow`);
        const photoURLRef = ref(database, `users/${username}/photoURL`);

        const [displayNameSnapshot, wantToShowSnapshot, photoURLSnapshot] = await Promise.all([
            get(displayNameRef),
            get(wantToShowRef),
            get(photoURLRef)
        ]);

        return {
            name: displayNameSnapshot.val(),
            id: username,
            wantToShow: wantToShowSnapshot.val(),
            photoURL: photoURLSnapshot.val()
        };
    };

    const fetchGalleryImages = async (galleryRef, setGalleryState) => {
        const snapshot = await get(galleryRef);
        const data = snapshot.val();

        if (data) {
            if (data.placeholder) {
                delete data.placeholder;
            }

            const dataPromises = Object.keys(data).map(async (key) => {
                const d = data[key];
                const userData = await getUserData(d.title);
                let downloadLink;
                try {
                    const r = storageRef(storage, d.image);
                    downloadLink = await getDownloadURL(r);
                    d.storageRef = d.image;
                } catch (e) {
                    console.log(e);
                    downloadLink = d.image;
                }
                return {
                    ...d,
                    title: userData.name,
                    username: d.title,
                    id: key,
                    userImage: userData.wantToShow ? await getDownloadURL(storageRef(storage, `profile_images/${d.title}`)) : null,
                    wantToShow: userData.wantToShow,
                    image: downloadLink
                };
            });

            const resolvedData = await Promise.all(dataPromises);
            setGalleryState(resolvedData);
        } else {
            setGalleryState([]);
        }
    };

    const handleAcceptImage = async (imageData) => {
        const reviewImageRef = ref(database, `/gallery/review/${imageData.id}`);
        const newImageKey = push(child(ref(database), '/gallery/uploaded')).key;
        const updates = {};
        updates[`/gallery/uploaded/${newImageKey}`] = imageData;

        try {
            await update(ref(database), updates);
            await remove(reviewImageRef);
        } catch (error) {
            console.error("Error transferring image:", error);
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await remove(ref(database, `/gallery/review/${imageId}`));
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    useEffect(() => {

        const processGalleryData = async (data) => {
            if (!data) return [];

            // Remove placeholder if it exists
            if (data.placeholder) {
                delete data.placeholder;
            }

            const dataPromises = Object.keys(data).map(async (key) => {
                const d = data[key];
                const userData = await getUserData(d.title);
                let downloadLink;
                try {
                    const r = storageRef(storage, d.image);
                    downloadLink = await getDownloadURL(r);
                    d.storageRef = d.image;
                } catch (e) {
                    console.log(e);
                    downloadLink = d.image;
                }
                return {
                    ...d,
                    title: userData.name,
                    username: d.title,
                    id: key,
                    userImage: userData.wantToShow ? await getDownloadURL(storageRef(storage, `profile_images/${d.title}`)) : null,
                    wantToShow: userData.wantToShow,
                    image: downloadLink
                };
            });

            return await Promise.all(dataPromises);
        };
        let uploadedUnsubscribe = () => {};
        let reviewUnsubscribe = () => {};

        const setupListeners = async () => {
            setIsLoading(true);

            if (!roles) {
                return;
            }

            setIsGalleryAdmin(roles.galleryAdmin);

            // Real-time listener for uploaded gallery items
            const uploadedRef = ref(database, '/gallery/uploaded');
            uploadedUnsubscribe = onValue(uploadedRef, async (snapshot) => {
                const data = snapshot.val();
                const processedData = await processGalleryData(data);
                setGalleryItems(processedData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error getting uploaded gallery items:", error);
                setIsLoading(false);
            });

            // Real-time listener for review items if admin
            if (roles.galleryAdmin) {
                const reviewRef = ref(database, '/gallery/review');
                reviewUnsubscribe = onValue(reviewRef, async (snapshot) => {
                    const data = snapshot.val();
                    const processedData = await processGalleryData(data);
                    setReviewItems(processedData);
                }, (error) => {
                    console.error("Error getting review items:", error);
                });
            }
        };

        setupListeners();

        // Cleanup listeners on unmount
        return () => {
            uploadedUnsubscribe();
            reviewUnsubscribe();
        };
    }, [roles]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-red-600 font-metal tracking-wider mb-8 animate-pulse">
                        Loading Gallery
                    </h1>
                        <div className="w-full max-w-md mx-auto h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-800 animate-pulse"></div>
                        </div>

                    <p className="text-xl text-gray-400 italic animate-pulse">
                        Unleashing the metal masterpieces...
                    </p>
                </div>

                {/* Sound wave animation */}
                <div className="flex items-center justify-center gap-1 mt-10">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-red-600 rounded-full animate-pulse"
                            style={{
                                height: `${20 + Math.random() * 30}px`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-200">
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div className="container mx-auto px-4 py-8">
                <div className="relative">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-center my-8 text-red-600 font-metal tracking-wider animate-enter">
                        Gallery
                    </h1>
                    <div className="w-full h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 my-6"></div>
                    <p className="text-xl text-center text-gray-400 italic mb-12">Welcome to the metal gallery</p>

                    <div className="flex flex-col items-center mt-10 mb-12">
                        <h3 className="text-2xl font-bold text-red-500 mb-4">Upload Art</h3>
                        <Link href="/gallery/upload" className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wider transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg rounded">
                            UPLOAD
                        </Link>
                    </div>

                    {isGalleryAdmin && (
                        <div className="mt-20 mb-10">
                            <h3 className="text-4xl font-bold text-red-600 mb-6">
                                Review
                            </h3>
                            <div className="h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 my-6"></div>

                            {reviewItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-xl text-gray-400">No items to review at this time</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {reviewItems.map((item, index) => (
                                        <div key={index} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-lg">
                                            <Link href={`${item.image}?fullScale=true`} className="block relative h-64 overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.descriptionEng}
                                                    className="object-cover object-center w-full h-full transition-transform duration-500 hover:scale-110"
                                                    width={400}
                                                    height={300}
                                                    unoptimized={true}
                                                />
                                            </Link>
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    {item.wantToShow && (
                                                        <div className="mr-3 relative w-12 h-12 border-2 border-red-500 rounded-full overflow-hidden">
                                                            <Image
                                                                src={item.userImage}
                                                                alt={item.title}
                                                                className="rounded-full object-cover"
                                                                width={50}
                                                                height={50}
                                                                unoptimized={true}
                                                            />
                                                        </div>
                                                    )}
                                                    {item.id ? (
                                                        <Link href={`/author/${item.id}`} className="text-lg font-bold text-red-400 hover:text-red-300">
                                                            {item.title}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-300">{item.title}</span>
                                                    )}
                                                </div>
                                                {item.descriptionEl && (
                                                    <p className="text-gray-400 mb-2 italic">{item.descriptionEl}</p>
                                                )}
                                                {item.descriptionEng && (
                                                    <p className="text-gray-300 mb-4">{item.descriptionEng}</p>
                                                )}
                                                <div className="flex justify-between mt-4">
                                                    <button
                                                        className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-bold uppercase transition duration-300 ease-in-out transform hover:scale-105 rounded"
                                                        onClick={() => handleAcceptImage(item)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold uppercase transition duration-300 ease-in-out transform hover:scale-105 rounded"
                                                        onClick={() => handleDeleteImage(item.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {galleryItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-2xl text-gray-400 mb-4">No artwork yet</p>
                            <p className="text-lg text-gray-500">Be the first to upload your metal-inspired art!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {galleryItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-red-900/30"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation: 'fadeIn 0.5s ease-in-out forwards'
                                    }}
                                >
                                    <Link href={`${item.image}?fullScale=true`} className="block relative h-64 overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.descriptionEng}
                                            className="object-cover object-center w-full h-full transition-transform duration-500 hover:scale-110"
                                            width={400}
                                            height={300}
                                            unoptimized={true}
                                        />
                                    </Link>
                                    <div className="p-4">
                                        <div className="flex items-center mb-3">
                                            {item.wantToShow && (
                                                <div className="mr-3 relative w-12 h-12 border-2 border-red-500 rounded-full overflow-hidden">
                                                    <Image
                                                        src={item.userImage}
                                                        alt={item.title}
                                                        className="rounded-full object-cover w-full h-full"
                                                        width={50}
                                                        height={50}
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            )}
                                            {item.id ? (
                                                <Link href={`/author/${item.username}`} className="text-lg font-bold text-red-400 hover:text-red-300">
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                <span className="text-lg font-bold text-gray-300">{item.title}</span>
                                            )}
                                        </div>
                                        {item.descriptionEl && (
                                            <p className="text-gray-400 mb-2 italic">{item.descriptionEl}</p>
                                        )}
                                        {item.descriptionEng && (
                                            <p className="text-gray-300">{item.descriptionEng}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}