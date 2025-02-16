import React, { useEffect, useRef, useState } from 'react';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { auth, database } from '../firebase/config';
import { getIdTokenResult } from 'firebase/auth';
import { CommentAuthor } from './CommentAuthor';

const CommentSystem = ({ articleName, commentId }) => {
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyComment, setReplyComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const replyInputRef = useRef(null);

    useEffect(() => {
        const commentsRef = ref(database, `comments/${articleName}`);
        onValue(commentsRef, (snapshot) => {
            setComments(snapshot.val() || {});
        });
    }, [articleName]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const commentAdminRef = ref(database, `roles/comments`);
                get(commentAdminRef).then((snapshot) => {
                    setIsAdmin(snapshot.exists() && snapshot.val().includes(user.email));
                });

                const idTokenResult = await getIdTokenResult(user);
                const userRef = ref(database, `${idTokenResult.claims.admin ? 'authors' : 'users'}/${user.uid}`);
                await update(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL || ''
                });

                setCurrentUser({ uid: user.uid, displayName: user.displayName, photoURL: user.photoURL });
            } else {
                setCurrentUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handlePostComment = () => {
        if (newComment.trim() && currentUser) {
            const newCommentRef = push(ref(database, `comments/${articleName}`));
            set(newCommentRef, {
                text: newComment,
                user: currentUser.uid,
                displayName: currentUser.displayName,
                timestamp: Date.now(),
                replies: {},
            });
            setNewComment('');
        }
    };

    const handleDeleteComment = async (commentId) => remove(ref(database, `comments/${articleName}/${commentId}`));

    const handleEditComment = (commentId, text) => {
        setEditingCommentId(commentId);
        setEditedComment(text);
    };

    const handleSaveEditedComment = async (commentId) => {
        await update(ref(database, `comments/${articleName}/${commentId}`), { text: editedComment });
        setEditingCommentId(null);
        setEditedComment('');
    };

    const renderComments = (comments, parent) => {
        return Object.keys(comments).map((key) => {
            const comment = comments[key];
            const isAuthor = currentUser && comment.user === currentUser.uid;
            return (
                <div key={key} className="bg-black text-white border border-red-700 rounded-lg p-4 shadow-md mb-4">
                    <p className="text-red-500 font-bold text-lg gothic-font"><CommentAuthor authorCode={comment.displayName} /></p>
                    {editingCommentId === key ? (
                        <input type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)}
                               className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-600" />
                    ) : (
                        <p className="text-gray-300">{comment.text}</p>
                    )}
                    <div className="flex space-x-4 mt-2">
                        {isAuthor && <button onClick={() => handleEditComment(key, comment.text)} className="text-yellow-500">Edit</button>}
                        {(isAuthor || isAdmin) && <button onClick={() => handleDeleteComment(key)} className="text-red-500">Delete</button>}
                    </div>
                    {comment.replies && <div className="ml-6 mt-3 border-l border-red-700 pl-4">{renderComments(comment.replies, key)}</div>}
                </div>
            );
        });
    };

    return (
        <div className="max-w-2xl mx-auto mt-6 gothic-font">
            <div className="bg-black text-white p-4 rounded-lg border border-red-700">
                <input type="text" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
                       className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-600" />
                <button onClick={handlePostComment} className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-900">
                    {currentUser ? "Post Comment" : "Log In to Post"}
                </button>
            </div>
            <div className="mt-4">{Object.keys(comments).length > 0 ? renderComments(comments, null) : <p className="text-gray-400">No comments yet.</p>}</div>
        </div>
    );
};

export default CommentSystem;
