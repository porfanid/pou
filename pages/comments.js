import React, { useEffect, useState } from 'react';
import { get, ref, remove } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { database } from '../firebase/config'; // Adjust the import path as needed
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct

const ReportedCommentsContainer = () => {
    const [reportedComments, setReportedComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const { roles } = useAuth();

    useEffect(() => {
        if (roles.comments) {
            setIsAdmin(true);
            fetchReportedComments().then();
        } else {
            router.push("/");
        }
    }, [router, roles]);

    const fetchReportedComments = async () => {
        setLoading(true);
        const snapshot = await get(ref(database, `reported_comments`));
        const data = snapshot.val() || {};
        const comments = [];

        for (const articleName in data) {
            for (const reportId in data[articleName]) {
                const { commentId } = data[articleName][reportId];
                const commentPath = `comments/${articleName}/${commentId}`;

                const commentSnapshot = await get(ref(database, commentPath));
                if (commentSnapshot.exists()) {
                    comments.push({
                        id: commentId,
                        articleName,
                        ...commentSnapshot.val(),
                        commentPath,
                    });
                }
            }
        }

        setReportedComments(comments);
        setLoading(false);
    };

    const handleCardClick = (articleName, commentId) => {
        router.push(`/article/${articleName}?commentId=${commentId}`);
    };

    const handleRemoveComment = async (commentPath, reportId) => {
        await remove(ref(database, commentPath));
        await remove(ref(database, `reported_comments/${commentPath.split('/')[1]}/${reportId}`));
        fetchReportedComments();
    };

    if (!isAdmin) {
        return <p>You do not have permission to view reported comments.</p>;
    }

    return (
        <div className="container mx-auto mt-4 text-white px-4">
            <h3 className="text-xl font-bold mb-4">Reported Comments</h3>
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            ) : reportedComments.length === 0 ? (
                <p>No reported comments.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportedComments.map((comment) => (
                        <div key={comment.id} className="mb-4">
                            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="p-4">
                                    <h4 className="text-lg font-medium mb-2">{comment.displayName}</h4>
                                    <p className="mb-4">{comment.text}</p>
                                    <div className="flex justify-between">
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                                            onClick={() => handleRemoveComment(comment.commentPath, comment.id)}
                                        >
                                            Remove Comment
                                        </button>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                            onClick={() => handleCardClick(comment.articleName, comment.id)}
                                        >
                                            View Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportedCommentsContainer;