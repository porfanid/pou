import React, { useEffect, useState } from 'react';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { database } from '../firebase/config';
import { CommentAuthor } from './CommentAuthor';
import { useAuth } from '../context/AuthContext';

const CommentSystem = ({ articleName }) => {
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');

    const { user, roles } = useAuth();
    const isAdmin = roles && roles.isCommentAdmin;

    useEffect(() => {
        const commentsRef = ref(database, `comments/${articleName}`);
        const unsubscribe = onValue(commentsRef, (snapshot) => {
            setComments(snapshot.val() || {});
        });

        return () => unsubscribe();
    }, [articleName]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (!user || !user.uid || !user.displayName) {
            console.error("Error: Missing user data");
            return;
        }

        try {
            const newCommentRef = push(ref(database, `comments/${articleName}`));
            await set(newCommentRef, {
                text: newComment,
                user: user.uid,
                displayName: user.displayName,
                timestamp: Date.now(),
                replies: {},
            });

            setNewComment('');
        } catch (error) {
            console.error("Firebase Error:", error.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await remove(ref(database, `comments/${articleName}/${commentId}`));
        } catch (error) {
            console.error("Error deleting comment:", error.message);
        }
    };

    const handleEditComment = (commentId, text) => {
        setEditingCommentId(commentId);
        setEditedComment(text);
    };

    const handleSaveEditedComment = async (commentId) => {
        if (!editedComment.trim()) return;

        try {
            await update(ref(database, `comments/${articleName}/${commentId}`), { text: editedComment });
            setEditingCommentId(null);
            setEditedComment('');
        } catch (error) {
            console.error("Error updating comment:", error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedComment('');
    };

    const renderComments = (comments) => {
        return Object.keys(comments).map((key) => {
            const comment = comments[key];
            const isAuthor = user && comment.user === user.uid;

            return (
                <div key={key} className="bg-black text-white border border-red-700 rounded-lg p-4 shadow-md mb-4">
                    <div className="text-red-500 font-bold text-lg gothic-font">
                        <CommentAuthor authorCode={comment.displayName} />
                    </div>

                    {editingCommentId === key ? (
                        <div>
                            <input
                                type="text"
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-600"
                            />
                            <div className="flex space-x-4 mt-2">
                                <button
                                    onClick={() => handleSaveEditedComment(key)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-800"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-300">{comment.text}</p>
                    )}

                    {!editingCommentId && (
                        <div className="flex space-x-4 mt-2">
                            {isAuthor && (
                                <button
                                    onClick={() => handleEditComment(key, comment.text)}
                                    className="text-yellow-500"
                                >
                                    Edit
                                </button>
                            )}
                            {(isAuthor || isAdmin) && (
                                <button
                                    onClick={() => handleDeleteComment(key)}
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}

                    {comment.replies && (
                        <div className="ml-6 mt-3 border-l border-red-700 pl-4">
                            {renderComments(comment.replies)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="max-w-2xl mx-auto mt-6 gothic-font">
            <div className="bg-black text-white p-4 rounded-lg border border-red-700">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-600"
                />
                <button
                    onClick={handlePostComment}
                    className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-900"
                >
                    {user ? "Post Comment" : "Log In to Post"}
                </button>
            </div>
            <div className="mt-4">
                {Object.keys(comments).length > 0 ? renderComments(comments) : <p className="text-gray-400">No comments yet.</p>}
            </div>
        </div>
    );
};

export default CommentSystem;
