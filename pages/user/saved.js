import React, { useEffect, useState } from "react";
import { auth, database } from "../../firebase/config";
import {get, onValue, ref, ref as databaseRef} from "firebase/database";
import SavedArticleData from "./articleData";
import {useAuth} from "../../context/AuthContext";

const SavedArticles = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useAuth();

    async function checkIfReferenceExists(path) {
        const reference = ref(database, path);
        const snapshot = await get(reference);
        return snapshot.exists();
    }

    useEffect(() => {
        console.log("User:", user);
            if (user) {
                let dataRef;
                console.log(`authors/${user.uid}/savedArticles/`);
                checkIfReferenceExists(`authors/${user.uid}`).then(async (exists) => {
                    if (exists) {
                        dataRef = databaseRef(database, `authors/${user.uid}/savedArticles/`);
                    } else {
                        dataRef = databaseRef(database, `users/${user.uid}/savedArticles/`);
                    }

                    console.log("User exists");

                    get(dataRef).then(snapshot => {
                        setData(snapshot.val());
                        console.log(snapshot.val())
                        setLoading(false);
                    });
                });
            } else {
                setData(null);
            }
        }, [user]);

    return (
        <div className="container text-white" style={{ backgroundColor: "#000", color: "#fff" }}>
            <h1 className="text-center" style={{ fontFamily: 'Impact, sans-serif', color: "#e60000" }}>
                Saved Articles
            </h1>
            <div className="row mb-5">
                {loading ? (
                    <p className="text-center" style={{ color: "#e60000" }}>Loading...</p>
                ) : data ? (
                    Object.entries(data).map(([articleKey, articleData]) => (
                        <div className="col-md-4 mb-4" key={articleKey}>
                            <SavedArticleData article={articleKey} isSaved={articleData} />
                        </div>
                    ))
                ) : (
                    <p className="text-center" style={{ color: "#e60000" }}>No data to fetch</p>
                )}
            </div>
        </div>
    );
};

export default SavedArticles;
