import React, { useEffect, useState } from "react";
import { database } from "../firebase/config";
import { get, ref, child } from "firebase/database";

export function CommentAuthor({ authorCode }) {
    const [user, setUser] = useState(null);
    const [userCard, setUserCard] = useState({ show: false, position: { top: 0, left: 0 } });

    const showUserCard = (e) => {
        setUserCard({ show: true, position: { top: e.clientY + 10, left: e.clientX + 10 } });
    };

    const hideUserCard = () => {
        setUserCard({ show: false });
    };

    useEffect(() => {
        const fetchUser = async () => {
            const paths = ["authors", "users", "bands"];

            for (const path of paths) {
                try {
                    const displayNameRef = child(ref(database), `${path}/${authorCode}/displayName`);
                    const photoURLRef = child(ref(database), `${path}/${authorCode}/photoURL`);

                    const displayNameSnap = await get(displayNameRef);
                    const photoURLSnap = await get(photoURLRef);

                    if (displayNameSnap.exists() || photoURLSnap.exists()) {
                        setUser({
                            displayName: displayNameSnap.val() || authorCode, // Fallback to authorCode
                            photoURL: photoURLSnap.exists() ? photoURLSnap.val() : null,
                        });
                        return;
                    }
                } catch (error) {
                    console.error(`Firebase Error: ${error.message}`);
                }
            }

            setUser({ displayName: authorCode, photoURL: null }); // Default if not found
        };

        fetchUser();
    }, [authorCode]);

    return (
        <>
            <span
                onMouseOver={showUserCard}
                onMouseOut={hideUserCard}
            >
                @{user ? user.displayName : authorCode}
            </span>

            {userCard.show && user && (
                <div
                    className="user-card"
                    style={{
                        position: 'absolute',
                        top: userCard.position.top,
                        left: userCard.position.left,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        padding: '10px',
                        zIndex: 1000,
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <strong>{user.displayName}</strong>
                    {user.photoURL && <img src={user.photoURL} alt={user.displayName} className="img-fluid rounded-circle" />}
                </div>
            )}
        </>
    );
}
