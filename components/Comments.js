// CommentSystem.js
import React, {useEffect, useRef, useState} from 'react';
import {get, onValue, push, ref, remove, set, update} from 'firebase/database';
import {auth, database} from '../firebase/config'; // Import Firebase auth
import {Button, Card, Form, InputGroup, Modal} from 'react-bootstrap';
import {CommentAuthor} from "./CommentAuthor";
import {getIdTokenResult} from "firebase/auth";

const CommentSystem = ({articleName, commentId}) => {
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyComment, setReplyComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const replyInputRef = useRef(null);

    const [isAdmin, setIsAdmin] = useState(false);

    const [show, setShow] = useState(false);



    useEffect(() => {
        if (commentId) {
            const commentElement = document.getElementById(commentId);
            if (commentElement) {
                console.log("Element was found", commentElement);
                commentElement.scrollIntoView({behavior: 'smooth'});
                commentElement.classList.add('highlight');
            }else{
                console.log("no Element was found")
            }
        }else{
            console.log("no commentId")
        }
    }, [comments]);

    useEffect(() => {
        const commentsRef = ref(database, `comments/${articleName}`);
        onValue(commentsRef, (snapshot) => {
            const data = snapshot.val();
            setComments(data || {});
        });
    }, [articleName]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const commentAdminRef = ref(database, `roles/comments`);
                get(commentAdminRef).then((snapshot) => {
                    let commentAdmins;
                    if (!snapshot.exists()) {
                        commentAdmins = []
                    } else {
                        commentAdmins = snapshot.val();
                    }

                    setIsAdmin(commentAdmins.includes(user.email));
                })
                const idTokenResult = await getIdTokenResult(user);

                let userFolder;
                if (idTokenResult.claims && idTokenResult.claims.admin) {
                    userFolder = 'authors';
                } else {
                    userFolder = 'users';
                }
                const userRef = ref(database, `${userFolder}/${user.uid}`);
                await update(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL || ''
                });

                setCurrentUser({
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                });
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handlePostComment = () => {
        if (newComment.trim() && currentUser) {
            const commentsRef = ref(database, `comments/${articleName}`);
            const newCommentRef = push(commentsRef);
            set(newCommentRef, {
                text: newComment,
                user: currentUser.uid,
                displayName: currentUser.displayName,
                timestamp: Date.now(),
                replies: {},
            }).then();
            setNewComment('');
        }
    };

    const handlePostReply = async (parentId) => {
        if (replyComment.trim() && parentId && currentUser) {
            const repliesRef = ref(database, `comments/${articleName}/${parentId}/replies`);
            const newReplyRef = push(repliesRef);
            await set(newReplyRef, {
                text: replyComment,
                user: currentUser.uid,
                displayName: currentUser.displayName, // Use displayName instead of uid
                timestamp: Date.now(),
            });

            setReplyComment('');
            setReplyTo(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const commentRef = ref(database, `comments/${articleName}/${commentId}`);
        await remove(commentRef);
    };

    const handleEditComment = (commentId, currentText) => {
        setEditingCommentId(commentId);
        setEditedComment(currentText);
    };

    const handleSaveEditedComment = async (commentId) => {
        console.log(`comments/${articleName}/${commentId}`);
        const commentRef = ref(database, `comments/${articleName}/${commentId}`);
        await update(commentRef, {text: editedComment});
        setEditingCommentId(null);
        setEditedComment('');
    };

    const handleClose = () => setShow(false);
    const handleReportComment = async (commentId, parent) => {
        const reportRef = ref(database, `reported_comments/${articleName}/${commentId}`);
        await set(reportRef, {reportedAt: Date.now(), reportedBy: currentUser.uid, parent: parent});
        setShow(true);
    };

    const renderComments = (comments, parent, shouldLeaveMargin) => {
        return Object.keys(comments).map((key) => {
            const comment = comments[key];
            const isAuthor = currentUser && comment.user === currentUser.uid;

            return (
                <Card id={key} key={key} className={`w-100 rounded-4 bg-dark text-white ${shouldLeaveMargin ? "mb-3" : ""}`}>
                    <Card.Body>
                        <Card.Title>
                            <CommentAuthor authorCode={comment.displayName}/>
                        </Card.Title>
                        {editingCommentId === (!parent ? key : `${parent}/replies/${key}`) ? (
                            <InputGroup className="mb-3">
                                <Form.Control
                                    className={"bg-dark text-white"}
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                />
                                <Button variant="outline-secondary"
                                        onClick={() => handleSaveEditedComment(!parent ? key : `${parent}/replies/${key}`)}>
                                    Save
                                </Button>
                                <Button variant="outline-secondary" onClick={() => setEditingCommentId(null)}>
                                    Cancel
                                </Button>
                            </InputGroup>
                        ) : (
                            <Card.Text>{comment.text}</Card.Text>
                        )}
                        {isAuthor && (
                            <Button variant="link" className="text-warning"
                                    onClick={() => handleEditComment(!parent ? key : `${parent}/replies/${key}`, comment.text)}>
                                Edit
                            </Button>
                        )}
                        {(isAuthor||isAdmin) && (
                            <Button variant="link" className="text-danger"
                                    onClick={() => handleDeleteComment(!parent ? key : `${parent}/replies/${key}`)}>
                                Delete
                            </Button>
                        )}
                        {currentUser ? (
                            <Button
                                variant="link"
                                className={`rounded-5 ${(!currentUser) ? "disabled" : ""}`}
                                onClick={() => {
                                    setReplyTo(parent ? parent : key);
                                    setTimeout(() => {
                                        if (replyInputRef.current) replyInputRef.current.focus();
                                    }, 0);
                                }}
                                disabled={!currentUser}
                            >
                                Reply
                            </Button>
                        ) : (
                            <p className="text-secondary">You need to be logged in to reply</p>
                        )}

                        {currentUser && (
                            <Button variant="link" className="text-danger"
                                    onClick={() => handleReportComment(key, parent)}>
                                Report
                            </Button>
                        )}

                        <Modal size={"md"} className={"bg-transparent"} show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>The comment has been reported successfully</Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={handleClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {replyTo === key && (
                            <InputGroup className="mb-3 row w-100">
                                <div className={"col-12 col-md-8"}>
                                    <Form.Control
                                        ref={replyInputRef}
                                        className={"bg-dark text-white"}
                                        placeholder="Write a reply..."
                                        value={replyComment}
                                        onChange={(e) => setReplyComment(e.target.value)}
                                    />
                                </div>
                                <div className={"col-12 col-md-4 d-flex justify-content-center mt-3 mt-md-0"}>
                                    <Button
                                        variant="outline-secondary"
                                        className="rounded-3"
                                        onClick={() => handlePostReply(key)}
                                    >
                                        Post Reply
                                    </Button>
                                </div>
                            </InputGroup>
                        )}
                        {comment.replies &&
                            <div className="ml-4 shadow-lg border border-secondary pt-3 p-1">
                                {renderComments(comment.replies, key, true)}
                            </div>
                        }
                    </Card.Body>
                </Card>
            );
        });
    };

    return (
        <div className="container mt-4">
            <Card className="mb-3 bg-dark text-white w-100 rounded-4">
                <Card.Body>
                    <Form.Control
                        placeholder="Write a comment..."
                        value={newComment}
                        className={"bg-dark text-white"}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                        className="mt-2 rounded-5"
                        onClick={handlePostComment}
                        disabled={!currentUser}
                    >
                        {(!currentUser) ? "Log In to Post" : "Post Comment"}
                    </Button>
                </Card.Body>
            </Card>

            {Object.keys(comments).length > 0 ? (
                renderComments(comments, null, false)
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
};

export default CommentSystem;