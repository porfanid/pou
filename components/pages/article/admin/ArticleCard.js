import React from 'react';

const renderArticleCard = (file, isAlreadyPublished, isEarlyReleased) => {
    const articleLink = `/article/${isEarlyReleased ? 'early/' : ''}${file.name.replace('.json', '')}`;
    const cardTitle = file.title || 'Untitled';

    function renderActionButtons(file, isAlreadyPublished, isEarlyReleased, userRoles) {
        const articleLink = `/article/${isEarlyReleased ? 'early/' : ''}${file.name.replace('.json', '')}`;

        const isAuthor = userRoles.isAuthor && user.uid === (file.translatedBy || file.author);
        const isLeader = userRoles.isLeader;
        const canEdit = (isLeader || isAuthor) && !isAlreadyPublished && !isEarlyReleased;
        const canDelete = !isLeader && !isAuthor;
        const canPublishNormal = !isAlreadyPublished && isEarlyReleased && !isLeader && !isAuthor;
        const canPublishEarly = !isAlreadyPublished && !isEarlyReleased && !isLeader && !isAuthor;

        if (canEdit || canDelete || canPublishNormal || canPublishEarly) {
            return (
                <div className="bg-gray-800 text-white flex justify-evenly p-2 rounded">
                    {canEdit && (
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleEdit(file, isAlreadyPublished, isEarlyReleased)}
                        >
                            Edit
                        </button>
                    )}

                    {canDelete && (
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDelete(file, isAlreadyPublished, isEarlyReleased)}
                        >
                            Delete
                        </button>
                    )}

                    {canPublishNormal && (
                        <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            onClick={() => handlePublish(false, file, isEarlyReleased)}
                        >
                            Normal
                        </button>
                    )}

                    {canPublishEarly && (
                        <>
                            <button
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                onClick={() => handlePublish(false, file, isEarlyReleased)}
                            >
                                Early
                            </button>
                            <button
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                onClick={() => handlePublish(true, file, isEarlyReleased)}
                            >
                                Normal
                            </button>
                        </>
                    )}
                </div>
            );
        } else {
            return null;
        }
    }

    const handleDelete = async (file) => {
        const articleRef = storageRef(storage, `${file.folder}/${file.name}.json`);
        const articleDownloadLink = await getDownloadURL(articleRef);
        const articleDataString = await fetch(articleDownloadLink);
        const fileData = await articleDataString.json();
        const isConfirmed = window.confirm(`Are you sure you want to delete the file "${file.name}"?`);
        if (!isConfirmed) return;
        try {
            const fileRef = storageRef(storage, `${file.folder}/${file.name}.json`);
            if (fileData.translations && Object.keys(fileData.translations).length < 2) {
                const image = getRef(fileData.img01, false);
                deleteImage(image);
            }
            await deleteObject(fileRef);
        } catch (error) {
            setError('Error deleting file: ' + error.message + " " + JSON.stringify(file));
        }
    };

    const handleEdit = async (file) => {
        setLoading(true);
        try {
            const articleRef = storageRef(storage, `${file.folder}/${file.name}.json`);
            const articleDownloadLink = await getDownloadURL(articleRef);
            const articleDataString = await fetch(articleDownloadLink);
            const fileData = await articleDataString.json();

            const authorRef = databaseRef(database, `authors/${fileData.sub}`);
            const translatorRef = databaseRef(database, `authors/${fileData.translatedBy}`);
            const [authorSnapshot, translatorSnapshot] = await Promise.all([get(authorRef), get(translatorRef)]);

            setSelectedFile(file);
            setFileData(fileData);
            setSocials(fileData.socials || {});
            setAuthorName(authorSnapshot.exists() ? authorSnapshot.val().displayName || '' : '');
            setTranslatorName(translatorSnapshot.exists() ? translatorSnapshot.val().displayName || '' : '');
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching file data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (file) => {
        try {
            const fileRef = storageRef(storage, `${file.folder}/${file.name}.json`);
            const fileData = await (await fetch(await getDownloadURL(fileRef))).json();
            fileData.isReady = true;
            await uploadString(fileRef, JSON.stringify(fileData));
            alert('Article published successfully!');
        } catch (error) {
            setError('Error publishing file: ' + error.message);
        }
    };

    return (
        <div
            className={`p-4 rounded-lg shadow-md m-3 w-full sm:w-1/4 ${file.isReady ? 'bg-green-500' : file.authorApproved ? 'animate-pulse bg-gray-700' : 'bg-gray-900'}`}>
            <div className="p-4">
                <span className="inline-block px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded">
                    {file.date}
                </span>
                <div className="mt-2">
                    {(isEarlyReleased || isAlreadyPublished) ? (
                        <a href={articleLink} onClick={() => copyLinkToClipboard(articleLink)}
                           className="text-blue-500 hover:underline">
                            {cardTitle}
                        </a>
                    ) : (
                        <div className="text-white">{cardTitle}</div>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-600 p-2">
                {renderActionButtons(file, isAlreadyPublished, isEarlyReleased)}
            </div>
        </div>
    );
}

export default renderArticleCard;