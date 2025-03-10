import React from 'react';

const RenderArticleCard = ( file, isAlreadyPublished, isEarlyReleased, handlers, userRoles) => {

    const { handleDelete, handleEdit, handlePublish, copyLinkToClipboard } = handlers;
    const articleLink = `/article/${isEarlyReleased ? 'early/' : ''}${file.slug.replace('.json', '')}`;
    const cardTitle = file.title || file.slug;

    const user = { uid: file.author }; // Replace with actual user data from auth

    const renderActionButtons = (file, isAlreadyPublished, isEarlyReleased, userRoles) => {
        const isAuthor = userRoles.isAuthor && user.uid === (file.translatedBy || file.author);
        const isLeader = userRoles.isLeader;
        const isAdmin = userRoles.isAdmin;
        const canEdit = (isLeader || isAuthor) && !isAlreadyPublished && !isEarlyReleased;
        const canDelete = !isLeader && !isAuthor;
        const canPublishNormal = !isAlreadyPublished && isEarlyReleased && !isLeader && !isAuthor;
        const canPublishEarly = !isAlreadyPublished && !isEarlyReleased && !isLeader && !isAuthor;

        if (canEdit || canDelete || canPublishNormal || canPublishEarly || isAdmin) {
            return (
                <div className="bg-gray-800 text-white flex flex-col flex-wrap sm:flex-row justify-center sm:justify-evenly gap-2 p-4 rounded-lg w-full">
                    {(canEdit || isAdmin) && (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full sm:w-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEdit(file, isAlreadyPublished, isEarlyReleased);
                            }}
                        >
                            Edit
                        </button>
                    )}

                    {(canDelete || isAdmin) && (
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full sm:w-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(file, isAlreadyPublished, isEarlyReleased);
                            }}
                        >
                            Delete
                        </button>
                    )}

                    {(canPublishNormal || isAdmin) && (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePublish(false, file, isEarlyReleased);
                            }}
                        >
                            Normal
                        </button>
                    )}

                    {(canPublishEarly || isAdmin) && (
                        <>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePublish(false, file, isEarlyReleased);
                                }}
                            >
                                Early
                            </button>
                            <button
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 w-full sm:w-auto"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePublish(true, file, isEarlyReleased);
                                }}
                            >
                                Publish Normal
                            </button>
                        </>
                    )}
                </div>
            );
        } else {
            return null;
        }
    };


    return (
        <div
            key={file.title}
            className={`p-4 rounded-lg shadow-md m-3 w-full ${file.isReady ? 'bg-green-500' : file.authorApproved ? 'animate-pulse bg-gray-700' : 'bg-gray-900'}`}>
            <div className="p-4">
                <span className="inline-block px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded">
                    {file.date}
                </span>
                <div className="mt-2">
                    {(isEarlyReleased || isAlreadyPublished) ? (
                        <a
                            href={articleLink}
                            onClick={(e) => {
                                e.preventDefault();
                                copyLinkToClipboard(articleLink);
                            }}
                            className="text-blue-500 hover:underline">
                            {cardTitle}
                        </a>
                    ) : (
                        <div className="text-white">{cardTitle}</div>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-600 p-2 flex-wrap">
                {renderActionButtons(file, isAlreadyPublished, isEarlyReleased, userRoles)}
            </div>
        </div>
    );
};

export default RenderArticleCard;