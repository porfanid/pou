import React, {useEffect, useState} from 'react';
import {handleShowList} from '../../components/pages/article/admin/articleUtils';
import renderCategoryCards from '../../components/pages/article/admin/CategoryCards';
import RenderArticleCard from '../../components/pages/article/admin/ArticleCard';
import {useAuth} from "../../context/AuthContext";
import {getValue} from "firebase/remote-config";
import {config} from "../../firebase/config";
import Select from "react-select";
import DraftEditor, {exportOptions} from "../../components/editor/editor";
import {EditorState, ContentState, convertFromHTML} from "draft-js";
import {stateToHTML} from "draft-js-export-html";

const AdminPublishSystem = () => {
    const [sortByDate, setSortByDate] = useState(false);
    const [sortByCategory, setSortByCategory] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [fileData, setFileData] = useState({});
    const [authorName, setAuthorName] = useState("");
    const [socials, setSocials] = useState({facebook: "", instagram: "", spotify: "", youtube: ""});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [files, setFiles] = useState([]);
    const [earlyReleases, setEarlyReleases] = useState([]);
    const [publishedFiles, setPublishedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [oldData, setOldData] = useState({});
    const [folder, setFolder] = useState("");
    const {user, roles} = useAuth();
    const [categories, setCategories] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());


    useEffect(() => {
        setLoading(true);
        if (!roles || !roles.author) {
            setError("You are not authorized to view this page");
            setLoading(false);
            return;
        } else {
            setError("");
            console.log("roles", roles)
        }
        fetchAllFiles().then(() => {
            setLoading(false);
        });
    }, [roles]);


    useEffect(() => {
        const languages = getValue(config, "languages").asString();
        const parsedLanguages = Object.entries(JSON.parse(languages)).map(([key, value]) => ({
            value: key,
            label: value
        }));
        setLanguageOptions(parsedLanguages);

        const categories = getValue(config, "categories").asString();
        console.log(categories);
        const parsedCategories = JSON.parse(categories).map((category) => ({
            value: category,
            label: category
        }));
        console.log(parsedCategories)
        setCategories(parsedCategories);
    }, []);

    const setSlug = (regularFiles)=>{
        Object.keys(regularFiles).forEach(key => {
            Object.keys(regularFiles[key]).forEach(article => {
                if (!regularFiles[key][article].slug) {
                    console.log("Article = ", regularFiles[key][article])
                    console.log("Slug = ", article);
                    regularFiles[key][article].slug = article;
                    console.log("New zArticle = ", regularFiles[key][article])
                }
            });
        });
        return regularFiles;
    }

    const fetchAllFiles = async () => {
        try {
            // Fetch regular files
            const regularResponse = await fetch('/api/articles/list');
            if (!regularResponse.ok) throw new Error('Failed to fetch regular files');
            const regularData = await regularResponse.json();
            setFiles(setSlug(regularData.files) || []);
        } catch (err) {
            setError(`Error fetching Upload author files: ${err.message}`);
            console.log(err)
        }
        try{
            // Fetch early releases
            const earlyResponse = await fetch('/api/articles/list?type=early');
            if (!earlyResponse.ok) throw new Error('Failed to fetch early releases');
            const earlyData = await earlyResponse.json();
            setEarlyReleases(setSlug(earlyData.files) || []);
        } catch (err) {
            setError(`Error fetching published early released files: ${err.message}`);
            console.log(err)
        }
        try{
            // F`etch published files
            const publishedResponse = await fetch('/api/articles/list?type=published');
            if (!publishedResponse.ok) throw new Error('Failed to fetch published files');
            const publishedData = await publishedResponse.json();
            setPublishedFiles(setSlug(publishedData.files) || []);
        } catch (err) {
            setError(`Error fetching published files: ${err.message}`);
            console.log(err)
        }
    };

    // Convert HTML to Draft.js EditorState
    const convertHtmlToEditorState = (html) => {
        if (!html) return EditorState.createEmpty();

        const blocksFromHTML = convertFromHTML(html);
        const contentState = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap
        );

        return EditorState.createWithContent(contentState);
    };

    const handleChange = (e, field, isSocial, isObject) => {
        let value = e.target.value;
        if(isObject){
            value = JSON.parse(value)
        }

        if (isSocial) {
            setSocials({
                ...socials,
                [field]: value,
            });
        } else {
            setFileData({
                ...fileData,
                [field]: value,
            });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Convert editor state to HTML
            const contentState = editorState.getCurrentContent();
            const htmlContent = stateToHTML(contentState, exportOptions);

            // Update socials in fileData
            const updatedFileData = {
                ...fileData,
                content: htmlContent,
                socials
            };

            const response = await fetch('/api/articles/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    file: selectedFile,
                    fileData: updatedFileData,
                    authorName,
                    oldData,
                    folder
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("errorData", errorData);
                throw new Error(errorData.message || 'Failed to update articles');
            }

            setShowModal(false);
            showToastNotification('Article updated successfully!');
        } catch (err) {
            setError(`Error updating file: ${err.message}`);
        } finally {
            await fetchAllFiles(); // Refresh the lists
            setLoading(false);
        }
    };

    const handleDelete = async (file, isAlreadyPublished, isEarlyReleased) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete the file "${file.title || file.slug}"?`);
        if (!isConfirmed) return;

        let folder = "upload_from_authors";
        if (isAlreadyPublished) {
            folder = "articles";
        }
        if (isEarlyReleased) {
            folder = "early_releases";
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/articles/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    file,
                    folder
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete articles');
            }

            showToastNotification('Article deleted successfully!');
            await fetchAllFiles(); // Refresh the lists
        } catch (err) {
            setError(`Error deleting file: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (file, isAlreadyPublished, isEarlyReleased) => {
        setLoading(true);
        setError("");
        let folder = "upload_from_authors";
        if (isAlreadyPublished) {
            folder = "articles";
        }
        if (isEarlyReleased) {
            folder = "early_releases";
        }
        setFolder(folder)
        console.log(file);
        try {
            const response = await fetch(`/api/articles/get?name=${file.slug}&folder=${folder}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch articles data');
            }

            const data = await response.json();

            setOldData({
                file, data
            });

            setSelectedFile(file);
            setFileData(data.fileData);
            setSocials(data.fileData.socials || {});
            setAuthorName(data.fileData.sub || '');

            // Convert HTML content to EditorState
            const editorStateFromHTML = convertHtmlToEditorState(data.fileData.content);
            setEditorState(editorStateFromHTML);

            setShowModal(true);
        } catch (err) {
            setError(`Error fetching file data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (toNormal, file, isEarlyReleased, isAlreadyPublished, undo = false) => {
        setLoading(true);

        let folder = "upload_from_authors";
        if (isAlreadyPublished) {
            folder = "articles";
        }
        if (isEarlyReleased) {
            folder = "early_releases";
        }

        try {
            const response = await fetch('/api/articles/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    file,
                    toNormal,
                    isEarlyReleased,
                    folder,
                    undo
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to publish articles');
            }

            showToastNotification('Article published successfully!');
            await fetchAllFiles(); // Refresh the lists
        } catch (err) {
            setError(`Error publishing article: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyLinkToClipboard = (link) => {
        navigator.clipboard.writeText(window.location.origin + link).then(() => {
            showToastNotification('Link copied to clipboard!');
        });
    };

    const showToastNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Pass the handler functions to the articles card component
    const articleCardProps = {
        handleDelete,
        handleEdit,
        handlePublish,
        copyLinkToClipboard
    };

    return (
        <>
            <div className="container mt-4">
                <div className="flex items-center justify-between">
                    <div className="w-full">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-red-500  drop-shadow-lg">
                            Admin Publish System
                        </h1>
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
                                <label htmlFor="sort-by-category-switch" className="text-white mr-2">Sort by
                                    Category</label>
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
                {error && <div className="alert alert-danger p-3 bg-red-600 text-white rounded pt-100">{error}</div>}
                <hr className="bg-dark my-4"/>

                {loading && <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>}

                <div className="mb-4">
                    <h2 className="text-white mb-3">Uploaded Files <span className="text-info text-sm">green background means ready for publishing</span>
                    </h2>
                    {handleShowList(files, false, false, sortByCategory, sortByDate, renderCategoryCards, (file) => RenderArticleCard(file, false, false, articleCardProps, roles))}
                </div>

                <div className="mb-4">
                    <h2 className="text-white mb-3">Early Releases <span className="text-info text-sm">Click on an article to copy the link</span>
                    </h2>
                    {handleShowList(earlyReleases, false, true, sortByCategory, sortByDate, renderCategoryCards, (file) => RenderArticleCard(file, false, true, articleCardProps, roles))}
                </div>

                <div className="mb-4">
                    <h2 className="text-white mb-3">Already Published <span className="text-info text-sm">Click on an article to copy the link</span>
                    </h2>
                    {handleShowList(publishedFiles, true, false, sortByCategory, sortByDate, renderCategoryCards, (file) => RenderArticleCard(file, true, false, articleCardProps, roles))}
                </div>

                {/* Tailwind Toast */}
                {showToast && (
                    <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        <strong>Success!</strong>
                        <p>{toastMessage}</p>
                    </div>
                )}
            </div>

            {/* Tailwind Modal */}{showModal && (
            <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-75 overflow-y-auto">
                <div className="flex flex-col justify-center w-full pt-60 pb-60">
                    <div
                        className="relative mx-auto bg-gradient-to-br from-gray-900 to-black border-4 border-red-800 shadow-2xl rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto p-8">
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-400 text-3xl font-extrabold"
                        >
                            ✕
                        </button>

                        {/* Title */}
                        <h2 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-purple-700 to-red-600 drop-shadow-lg mb-6"
                            style={{fontFamily: 'Metal Mania, cursive'}}>
                            Edit Article
                        </h2>

                        {/* Form */}
                        <div className="space-y-4 text-white">
                            {/* Title */}
                            <div>
                                <label className="block text-sm mb-1">Title</label>
                                <input
                                    type="text"
                                    value={fileData.title || ""}
                                    onChange={(e) => handleChange(e, "title")}
                                    className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm mb-1">Description</label>
                                <textarea
                                    value={fileData.description || ""}
                                    onChange={(e) => handleChange(e, "description")}
                                    className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                    rows="4"
                                />
                            </div>

                            {/* Author Name */}
                            <div>
                                <label className="block text-sm mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={fileData.sub || ""}
                                    onChange={(e) => handleChange(e, "sub")}
                                    className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Category</label>

                                <Select
                                    value={categories.find(option => option.value === fileData.category)}
                                    onChange={(selectedOption) => handleChange({target: {value: selectedOption.value}}, "category")}
                                    options={categories}
                                    className="mt-2"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            backgroundColor: '#1f2937',
                                            borderColor: '#b91c1c',
                                            color: '#f00',
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            backgroundColor: '#1f2937',
                                            color: '#f00',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            color: '#ffffff',
                                            backgroundColor: '#1f2937',
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected ? '#791c1c' : state.isFocused ? '#471b1b' : '#1f2937',
                                            color: state.isSelected ? '#ffffff' : '#ffffff',
                                        })
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Language</label>
                                <Select
                                    value={languageOptions.find(option => option.value === fileData.lang)}
                                    onChange={(selectedOption) => handleChange({target: {value: selectedOption.value}}, "lang")}
                                    options={languageOptions}
                                    className="mt-2"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            backgroundColor: '#1f2937',
                                            borderColor: '#b91c1c',
                                            color: '#f00',
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            backgroundColor: '#1f2937',
                                            color: '#f00',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            color: '#ffffff',
                                            backgroundColor: '#1f2937',
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected ? '#791c1c' : state.isFocused ? '#471b1b' : '#1f2937',
                                            color: state.isSelected ? '#ffffff' : '#ffffff',
                                        })
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={fileData.slug || ""}
                                    onChange={(e) => handleChange(e, "slug")}
                                    className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Translations</label>
                                <input
                                    type="text"
                                    value={JSON.stringify(fileData.translations) || ""}
                                    onChange={(e) => handleChange(e, "translations", false, true)}
                                    className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>

                            {/* Social Links */}
                            <div>
                                <label className="block text-sm mb-2">Social Links</label>
                                {["facebook", "instagram", "spotify", "youtube"].map((social) => (
                                    <div key={social} className="mb-2">
                                        <label className="block text-xs uppercase">{social}</label>
                                        <input
                                            type="text"
                                            value={socials[social] || ""}
                                            onChange={(e) => handleChange(e, social, true)}
                                            className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Content - Using DraftEditor instead of textarea */}
                            <div>
                                <label className="block text-sm mb-1">Content</label>
                                <div className="bg-gray-800 border-2 border-red-800 rounded">
                                    <DraftEditor
                                        editorState={editorState}
                                        setEditorState={setEditorState}
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleSave}
                                    className="bg-red-800 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
                                    style={{fontFamily: 'Metal Mania, cursive'}}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        </>
    );
};

export default AdminPublishSystem;
