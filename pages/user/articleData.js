import React, { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../firebase";
import Link from "next/link";

const SavedArticleData = (props) => {
    const [data, setData] = useState({});

    const getFirebaseStorageUrl = async (imageUrl) => {
        const fileName = imageUrl.split("/").pop();
        const storageRef = ref(storage, `images/${fileName}`);
        return await getDownloadURL(storageRef);
    };

    const fetchData = async (link) => {
        const isEarlyAccess = false;

        try {
            let articleSnapshot;
            if (isEarlyAccess) {
                articleSnapshot = await getDownloadURL(
                    ref(storage, `early_releases/${link}.json`)
                );
            } else {
                articleSnapshot = await getDownloadURL(
                    ref(storage, `articles/${link}.json`)
                );
            }

            const response = await fetch(articleSnapshot);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            data.img01 = await getFirebaseStorageUrl(data.img01);
            return data;
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    useEffect(() => {
        console.log(props.article);
        fetchData(props.article).then((tempData) => {
            console.log(tempData);
            setData(tempData);
        });
    }, []);

    return (
        <div className="p-4">
            {props.isSaved ? (
                <div className="relative bg-[#1a1a1a] border border-gray-700 shadow-lg shadow-red-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-red-700">
                    <img className="w-full h-48 object-cover" src={data.img01} alt="Article Image" />
                    <div className="p-4">
                        <h5 className="text-xl font-extrabold text-red-500 uppercase drop-shadow-md">
                            {data.title}
                        </h5>
                        <Link className="block text-center mt-3 py-2 px-4 text-sm font-bold text-gray-200 uppercase border border-red-600 rounded-lg bg-red-800 hover:bg-red-600 hover:border-red-400 transition-all duration-300 shadow-lg shadow-red-900" to={`/article/${props.article}`}>
                            Read More
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-[#1a1a1a] border border-gray-700 shadow-lg shadow-red-900 rounded-lg">
                    <h5 className="text-xl font-extrabold text-red-500 uppercase">
                        {props.article}
                    </h5>
                    <p className="text-gray-400">This article is not saved</p>
                    <Link className="block text-center mt-3 py-2 px-4 text-sm font-bold text-gray-200 uppercase border border-red-600 rounded-lg bg-red-800 hover:bg-red-600 hover:border-red-400 transition-all duration-300 shadow-lg shadow-red-900" href={`/article/${props.article}`}>
                        Read More
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedArticleData;
