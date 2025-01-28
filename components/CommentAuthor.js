/*
 * Copyright (c) 2024. MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, {useEffect, useState} from "react";
import {database} from "../firebase/config";
import {get, ref} from "firebase/database";

export function CommentAuthor({authorCode}) {

    const [userCard, setUserCard] = useState({ show: false, position: { top: 0, left: 0 } });

    const [user, setUser] = useState({});

    const showUserCard = (user, e) => {
        const position = { top: e.clientY + 10, left: e.clientX + 10 };
        setUserCard({ show: true, user, position });
    };

    const hideUserCard = () => {
        setUserCard({ show: false, user: null, position: { top: 0, left: 0 } });
    };

    useEffect(() => {
        console.log(authorCode);
        let userRef = ref(database, `authors/${authorCode}`);
        get(userRef).then((snapshot) => {
            if(!snapshot.exists()){
                userRef = ref(database, `users/${authorCode}`);
                get(userRef).then((snapshot) => {
                    if(!snapshot.exists()){
                        userRef = ref(database, `bands/${authorCode}`);
                        get(userRef).then((snapshot) => {
                            setUser(snapshot.val());
                        });
                    }else {
                        setUser(snapshot.val());
                    }
                });
            }else {
                setUser(snapshot.val());
            }

            console.log(authorCode)
        })
    }, []);

    if(!user){
        return (
            <span
                onMouseOver={(e) => showUserCard(user, e)}
                onMouseOut={hideUserCard}
            >
                @{authorCode}
            </span>
        )
    }

    return (
        <>
            <span
                onMouseOver={(e) => showUserCard(user, e)}
                onMouseOut={hideUserCard}
            >
                @{user.displayName}
            </span>

            {userCard.show && (
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
                    <img src={user.photoURL} alt={user.displayName} className="img-fluid rounded-circle" />
                </div>
            )}
        </>
    )
}