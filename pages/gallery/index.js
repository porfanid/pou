// pages/gallery/index.js
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { auth, database, storage } from "../../firebase/config";
import { child, get, onValue, push, ref, remove, set, update } from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import {useAuth} from "../../context/AuthContext";
//import { deleteImage } from "@/systems/UploadSystem/articleData/articleData";

export default function ArtGallery() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [reviewItems, setReviewItems] = useState([]);
    const [isGalleryAdmin, setIsGalleryAdmin] = useState(false);
    const {user, roles} = useAuth();


    const getUserName = async (username) => {
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

    const fetchGalleryImages = (galleryRef, setGalleryState) => {
        return onValue(galleryRef, (snapshot) => {
            let data = snapshot.val();
            if (data) {
                console.log(data);

                // Remove the placeholder item if it exists
                if (data.placeholder) {
                    delete data.placeholder;
                }

                // First, create an array of promises
                const dataPromises = Object.keys(data).map(async (key) => {
                    const d = data[key];
                    const userData = await getUserName(d.title);
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
                        id: key,
                        userImage: userData.wantToShow ? await getDownloadURL(storageRef(storage, `profile_images/${d.title}`)) : null,
                        wantToShow: userData.wantToShow,
                        image: downloadLink
                    };
                });

                // Use Promise.all to wait for all promises to resolve
                Promise.all(dataPromises).then((resolvedData) => {
                    console.log(resolvedData);
                    setGalleryState(resolvedData);
                }).catch((error) => {
                    console.error("Error resolving data promises:", error);
                });
            } else {
                // If data is null, set the state to an empty array
                setGalleryState([]);
            }
        });
    };

    const handleAcceptImage = async (imageData) => {
        const reviewImageRef = ref(database, `/gallery/review/${imageData.id}`);

        // Generate a unique key for the new image
        const newImageKey = push(child(ref(database), '/gallery/uploaded')).key;

        // Construct the update object
        const updates = {};
        updates[`/gallery/uploaded/${newImageKey}`] = imageData;

        try {
            // Perform the update
            await update(ref(database), updates);
            // Remove the image from the review path
            await remove(reviewImageRef);
        } catch (error) {
            console.error("Error transferring image:", error);
        }
    };

    const handleDeleteImage = async (imageId) => {
        console.log("imageid: ", imageId);
        try {
            //await deleteImage(`/gallery/review/${imageId}`);
        } catch (error) {
            console.error("Error deleting image:", error);
        }
        console.log(`database: /gallery/review/${imageId}`);
        remove(ref(database, `/gallery/review/${imageId}`));
    };

    useEffect(() => {
        if(!roles){
            return;
        }
        setIsGalleryAdmin(roles.galleryAdmin);
        if (roles.galleryAdmin) {
            const reviewRef = ref(database, '/gallery/review');
            fetchGalleryImages(reviewRef, setReviewItems);
        }
        const reviewRef = ref(database, '/gallery/uploaded');
        fetchGalleryImages(reviewRef, setGalleryItems)
    }, [roles]);

    return (
        <div className="min-h-screen bg-black text-gray-200">
            {/* Hero Header with Metal Theme */}
            <div className="container mx-auto px-4 py-8">
                <div className="relative">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-center my-8 text-red-600 font-metal tracking-wider">
                        Gallery
                    </h1>
                    <div className="w-full h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 my-6"></div>
                    <p className="text-xl text-center text-gray-400 italic mb-12">Welcome to the metal gallery</p>

                    <div className="flex flex-col items-center mt-10 mb-12">
                        <h3 className="text-2xl font-bold text-red-500 mb-4">Upload Art</h3>
                        <Link href="/gallery/upload" className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wider transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
                            UPLOAD
                        </Link>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {galleryItems.map((item, index) => (
                            <div key={index} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-red-900/30">
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
                                        <p className="text-gray-300">{item.descriptionEng}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Admin Review Section */}
                    {isGalleryAdmin && (
                        <div className="mt-20 mb-10">
                            <h3 className="text-4xl font-bold text-red-600 mb-6">
                                Review
                            </h3>
                            <div className="h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 my-6"></div>

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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}