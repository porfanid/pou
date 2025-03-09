import { useState } from 'react';
import { handleShowList } from '../../components/pages/article/admin/articleUtils';
import renderCategoryCards from '../../components/pages/article/admin/CategoryCards';
import renderArticleCard from '../../components/pages/article/admin/ArticleCard';

const AdminPublishSystem = () => {
    const [sortByDate, setSortByDate] = useState(false);
    const [sortByCategory, setSortByCategory] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [fileData, setFileData] = useState({});
    const [authorName, setAuthorName] = useState("");
    const [socials, setSocials] = useState({ facebook: "", instagram: "", spotify: "", youtube: "" });

    // Placeholder for error messages
    const error = "";
    const earlyReleasesError = "";
    const alreadyPublishedError = "";

    const handleContentChange = (value) => {
        setFileData((prevState) => ({
            ...prevState,
            content: value,
        }));
    };

    const handleChange = (e, field, isSocial) => {
        if (isSocial) {
            setSocials({
                ...socials,
                [field]: e.target.value,
            });
        } else {
            setFileData({
                ...fileData,
                [field]: e.target.value,
            });
        }
    };

    const handleSave = () => {
        // Your save logic here
    };

    return (
        <>
            <div className="container mt-4">
                <div className="flex items-center justify-between">
                    <div className="w-1/3">
                        <h2 className="text-white">Admin Publish System</h2>
                    </div>
                    <div className="w-2/3 flex justify-end">
                        <div className="flex items-center space-x-4">
                            <div>
                                <label htmlFor="sort-by-date-switch" className="text-white mr-2">Sort by Date</label>
                                <input
                                    type="checkbox"
                                    id="sort-by-date-switch"
                                    checked={sortByDate}
                                    onChange={() => setSortByDate(!sortByDate)}
                                    className="toggle toggle-accent"
                                />
                            </div>
                            <div>
                                <label htmlFor="sort-by-category-switch" className="text-white mr-2">Sort by Category</label>
                                <input
                                    type="checkbox"
                                    id="sort-by-category-switch"
                                    checked={sortByCategory}
                                    onChange={() => setSortByCategory(!sortByCategory)}
                                    className="toggle toggle-accent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="bg-dark my-4" />
                <div className="mb-4">
                    <h3 className="text-light mb-3">Uploaded Files <span className="text-info text-sm">green background means ready for publishing</span></h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {handleShowList([], false, false, sortByCategory, sortByDate, renderCategoryCards, renderArticleCard)}
                </div>
                <div className="mb-4">
                    <h3 className="text-light mb-3">Early Releases <span className="text-info text-sm">Click on an article to copy the link</span></h3>
                    {earlyReleasesError && <div className="alert alert-danger">{earlyReleasesError}</div>}
                    {handleShowList([], false, true, sortByCategory, sortByDate, renderCategoryCards, renderArticleCard)}
                </div>
                <div className="mb-4">
                    <h3 className="text-light mb-3">Already Published <span className="text-info text-sm">Click on an article to copy the link</span></h3>
                    {alreadyPublishedError && <div className="alert alert-danger">{alreadyPublishedError}</div>}
                    {handleShowList([], true, false, sortByCategory, sortByDate, renderCategoryCards, renderArticleCard)}
                </div>

                {/* Tailwind Toast */}
                {showToast && (
                    <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        <strong>Link Copied!</strong>
                        <p>The article link has been copied to the clipboard.</p>
                    </div>
                )}
            </div>

            {/* Tailwind Modal */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-white text-2xl mb-4">Edit File Data</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="content" className="text-light">Content</label>
                                <textarea
                                    id="content"
                                    value={fileData.content}
                                    onChange={(e) => handleContentChange(e.target.value)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-light">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={fileData.title}
                                    onChange={(e) => handleChange(e, 'title', false)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="details" className="text-light">Details</label>
                                <input
                                    type="text"
                                    id="details"
                                    value={fileData.details}
                                    onChange={(e) => handleChange(e, 'details', false)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="facebook" className="text-light">Facebook</label>
                                <input
                                    type="text"
                                    id="facebook"
                                    value={socials.facebook}
                                    onChange={(e) => handleChange(e, 'facebook', true)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="instagram" className="text-light">Instagram</label>
                                <input
                                    type="text"
                                    id="instagram"
                                    value={socials.instagram}
                                    onChange={(e) => handleChange(e, 'instagram', true)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="spotify" className="text-light">Spotify</label>
                                <input
                                    type="text"
                                    id="spotify"
                                    value={socials.spotify}
                                    onChange={(e) => handleChange(e, 'spotify', true)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="youtube" className="text-light">YouTube</label>
                                <input
                                    type="text"
                                    id="youtube"
                                    value={socials.youtube}
                                    onChange={(e) => handleChange(e, 'youtube', true)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="img01" className="text-light">Image URL</label>
                                <input
                                    type="text"
                                    id="img01"
                                    value={fileData.img01}
                                    onChange={(e) => handleChange(e, 'img01', false)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="author" className="text-light">Author</label>
                                <input
                                    type="text"
                                    id="author"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="bg-dark text-white w-full p-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPublishSystem;