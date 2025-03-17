import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { getValue } from "firebase/remote-config";
import { config } from "../../firebase/config";
import Select from "react-select";
import DraftEditor, { exportOptions } from "../../components/editor/editor";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import slugify from 'slugify';

const TranslationSystem = () => {
    const [sortByDate, setSortByDate] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [fileData, setFileData] = useState({});
    const [translationData, setTranslationData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [files, setFiles] = useState([]);
    const [earlyReleases, setEarlyReleases] = useState([]);
    const [publishedFiles, setPublishedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const { user, roles } = useAuth();
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [newLanguage, setNewLanguage] = useState("");
    const [originalLanguage, setOriginalLanguage] = useState("");
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [folder, setFolder] = useState("");

    useEffect(() => {
        setLoading(true);
        if (!roles || (!roles.isTranslator && !roles.isAdmin)) {
            setError("You are not authorized to view this page");
            setLoading(false);
            return;
        } else {
            setError("");
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
        setAvailableLanguages(parsedLanguages);
    }, []);

    const fetchAllFiles = async () => {
        try {
            // Fetch regular files
            const regularResponse = await fetch('/api/articles/list');
            if (!regularResponse.ok) throw new Error('Failed to fetch regular files');
            const regularData = await regularResponse.json();
            setFiles(regularData.files || []);

            // Fetch early releases
            const earlyResponse = await fetch('/api/articles/list?type=early');
            if (!earlyResponse.ok) throw new Error('Failed to fetch early releases');
            const earlyData = await earlyResponse.json();
            setEarlyReleases(earlyData.files || []);

            // Fetch published files
            const publishedResponse = await fetch('/api/articles/list?type=published');
            if (!publishedResponse.ok) throw new Error('Failed to fetch published files');
            const publishedData = await publishedResponse.json();
            setPublishedFiles(publishedData.files || []);
        } catch (err) {
            setError(`Error fetching files: ${err.message}`);
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

    const handleChange = (e, field) => {
        let value = e.target.value;
        setTranslationData({
            ...translationData,
            [field]: value,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Convert editor state to HTML
            const contentState = editorState.getCurrentContent();
            const htmlContent = stateToHTML(contentState, exportOptions);

            // Generate slug for the translation
            const translationSlug = slugify(`${translationData.title}-${newLanguage}`);

            // Update translations in both files
            const originalTranslations = { ...fileData.translations, [newLanguage]: translationSlug };

            // Update original file with new translation reference
            const updateOriginalResponse = await fetch('/api/articles/update-translation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    file: selectedFile,
                    translations: originalTranslations,
                    folder
                }),
            });

            if (!updateOriginalResponse.ok) {
                const errorData = await updateOriginalResponse.json();
                throw new Error(errorData.message || 'Failed to update original article');
            }

            // Create translation file
            const updatedTranslationData = {
                ...translationData,
                content: htmlContent,
                slug: translationSlug,
                lang: newLanguage,
                translations: originalTranslations,
                isReady: false
            };

            const createTranslationResponse = await fetch('/api/articles/create-translation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    fileData: updatedTranslationData,
                    originalFile: selectedFile
                }),
            });

            if (!createTranslationResponse.ok) {
                const errorData = await createTranslationResponse.json();
                throw new Error(errorData.message || 'Failed to create translation');
            }

            setShowModal(false);
            showToastNotification('Translation saved successfully!');
        } catch (err) {
            setError(`Error saving translation: ${err.message}`);
        } finally {
            await fetchAllFiles(); // Refresh the lists
            setLoading(false);
        }
    };

    const handleTranslate = async (file, isAlreadyPublished, isEarlyReleased) => {
        setLoading(true);
        setError("");

        let folder = "upload_from_authors";
        if (isAlreadyPublished) {
            folder = "articles";
        }
        if (isEarlyReleased) {
            folder = "early_releases";
        }

        setFolder(folder);

        try {
            const response = await fetch(`/api/articles/get?name=${file.slug}&folder=${folder}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch article data');
            }

            const data = await response.json();

            setSelectedFile(file);
            setFileData(data.fileData);
            setTranslationData({
                ...data.fileData,
                title: data.fileData.title || "",
                description: data.fileData.description || "",
                category: data.fileData.category || "",
                sub: data.fileData.sub || "",
                date: data.fileData.date || new Date().toISOString(),
                translations: data.fileData.translations || {}
            });
            setOriginalLanguage(data.fileData.lang || "");

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

    const showToastNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const renderCategoryCards = (categoryMap, isAlreadyPublished, isEarlyReleased) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(categoryMap).map((category) => (
                    <div key={category} className="bg-gray-800 rounded-lg p-4 shadow">
                        <h3 className="text-xl text-white font-semibold mb-3">{category}</h3>
                        <ul className="space-y-2">
                            {categoryMap[category].map((file, index) => renderArticleCard(file, isAlreadyPublished, isEarlyReleased, index))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    const renderArticleCard = (file, isAlreadyPublished, isEarlyReleased, index) => {
        const isReady = file.isReady;
        const bgColorClass = isReady ? "bg-green-900" : "bg-gray-700";
        const hoverColorClass = isReady ? "hover:bg-green-800" : "hover:bg-gray-600";

        return (
            <li key={index}
                className={`${bgColorClass} ${hoverColorClass} rounded-lg p-3 shadow-md transition-all duration-200 cursor-pointer`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-white">{file.title || file.slug}</h4>
                        <p className="text-sm text-gray-300">{file.date}</p>
                        <p className="text-sm text-gray-300">Author: {file.sub}</p>

                        {/* Display available languages */}
                        {file.translations && Object.keys(file.translations).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Object.keys(file.translations).map(lang => {
                                    const languageLabel = availableLanguages.find(l => l.value === lang)?.label || lang;
                                    const isCurrent = lang === file.lang;

                                    return (
                                        <span key={lang}
                                              className={`text-xs px-2 py-1 rounded ${isCurrent ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                            {languageLabel}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleTranslate(file, isAlreadyPublished, isEarlyReleased)}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white py-1 px-3 rounded text-sm transition-colors duration-200"
                    >
                        Translate
                    </button>
                </div>
            </li>
        );
    };

    const handleShowList = (files, isAlreadyPublished, isEarlyReleased, sortByCategory, sortByDate) => {
        if (!files || !Object.keys(files).length) {
            return <div className="text-center text-gray-400 my-4">No files available</div>;
        }

        // Convert from object to array if needed
        let fileArray = Array.isArray(files) ? files : Object.keys(files).flatMap(category =>
            Object.keys(files[category]).map(slug => ({
                ...files[category][slug],
                slug,
                category
            }))
        );

        // Sort by date if required
        if (sortByDate) {
            fileArray = fileArray.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB - dateA; // Most recent first
            });
        }

        // Group by category if required
        if (sortByCategory) {
            const categoryMap = {};
            fileArray.forEach(file => {
                const category = file.category || 'Uncategorized';
                if (!categoryMap[category]) {
                    categoryMap[category] = [];
                }
                categoryMap[category].push(file);
            });
            return renderCategoryCards(categoryMap, isAlreadyPublished, isEarlyReleased);
        } else {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fileArray.map((file, index) => renderArticleCard(file, isAlreadyPublished, isEarlyReleased, index))}
                </div>
            );
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="flex items-center justify-between">
                    <div className="w-full">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-red-500 drop-shadow-lg">
                            Translation System
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
                    {handleShowList(files, false, false, false, sortByDate)}
                </div>

                <div className="mb-4">
                    <h2 className="text-white mb-3">Early Releases</h2>
                    {handleShowList(earlyReleases, false, true, false, sortByDate)}
                </div>

                <div className="mb-4">
                    <h2 className="text-white mb-3">Already Published</h2>
                    {handleShowList(publishedFiles, true, false, false, sortByDate)}
                </div>

                {/* Tailwind Toast */}
                {showToast && (
                    <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        <strong>Success!</strong>
                        <p>{toastMessage}</p>
                    </div>
                )}
            </div>

            {/* Translation Modal */}
            {showModal && (
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
                                Translate Article
                            </h2>

                            {/* Display original information */}
                            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-red-800">
                                <h3 className="text-white text-xl mb-2">Original Article</h3>
                                <p className="text-gray-300"><strong>Title:</strong> {fileData.title}</p>
                                <p className="text-gray-300"><strong>Language:</strong> {availableLanguages.find(l => l.value === originalLanguage)?.label || originalLanguage}</p>
                                <p className="text-gray-300"><strong>Author:</strong> {fileData.sub}</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4 text-white">
                                {/* Select language */}
                                <div>
                                    <label className="block text-sm mb-1">Translation Language</label>
                                    <Select
                                        value={availableLanguages.find(option => option.value === newLanguage)}
                                        onChange={(selectedOption) => setNewLanguage(selectedOption.value)}
                                        options={availableLanguages}
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

                                {/* Title */}
                                <div>
                                    <label className="block text-sm mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={translationData.title || ""}
                                        onChange={(e) => handleChange(e, "title")}
                                        className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm mb-1">Description</label>
                                    <textarea
                                        value={translationData.description || ""}
                                        onChange={(e) => handleChange(e, "description")}
                                        className="w-full p-2 bg-gray-800 text-white border-2 border-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                                        rows="4"
                                    />
                                </div>

                                {/* Category (readonly) */}
                                <div>
                                    <label className="block text-sm mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={translationData.category || ""}
                                        readOnly
                                        className="w-full p-2 bg-gray-700 text-white border-2 border-red-800 rounded"
                                    />
                                </div>

                                {/* Author (readonly) */}
                                <div>
                                    <label className="block text-sm mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={translationData.sub || ""}
                                        readOnly
                                        className="w-full p-2 bg-gray-700 text-white border-2 border-red-800 rounded"
                                    />
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
                                        disabled={!newLanguage}
                                        className={`${!newLanguage ? 'bg-gray-600' : 'bg-red-800 hover:bg-red-600'} text-white font-bold py-2 px-6 rounded-full shadow-lg text-xl transition duration-300 ease-in-out transform hover:scale-105`}
                                        style={{fontFamily: 'Metal Mania, cursive'}}
                                    >
                                        Save Translation
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

export default TranslationSystem;