import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import DraftEditor from "../../components/editor/editor";
import {EditorState} from "draft-js";

const ArticleUpload = () => {
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [category, setCategory] = useState("");
    const [language, setLanguage] = useState("en");
    const [socials, setSocials] = useState({ facebook: "", instagram: "", youtube: "", spotify: "" });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setImage(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*",
        maxFiles: 1,
    });

    const handleSocialChange = (e) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);




        if (!image) {
            setMessage({ type: "error", text: "Please upload an image." });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("details", details);
        //formData.append("articleContent", content);
        formData.append("category", category);
        formData.append("language", language);
        formData.append("socials", JSON.stringify(socials));
        formData.append("image", image);
        formData.append("uid", localStorage.getItem("uid"));

        try {
            const response = await axios.post("https://your-backend.com/api/upload-article", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage({ type: "success", text: response.data.message });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Failed to upload article" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gray-950 text-white rounded-2xl shadow-2xl border border-red-700 mt-10">
            <h2 className="text-4xl font-extrabold text-red-600 mb-6 uppercase tracking-widest text-center">Upload Your Metal Article</h2>
            {message && (
                <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"} text-center font-bold`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-semibold text-red-400">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Details</label>
                    <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} required className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Content</label>
                    <DraftEditor setEditorState={setEditorState} editorState={editorState}/>
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Category</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500">
                        <option value="en">English</option>
                        <option value="el">Greek</option>
                    </select>
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Social Media Links</label>
                    {Object.keys(socials).map((platform) => (
                        <input
                            key={platform}
                            type="url"
                            name={platform}
                            placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                            value={socials[platform]}
                            onChange={handleSocialChange}
                            className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                        />
                    ))}
                </div>

                <div {...getRootProps()} className={`mt-4 p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${isDragActive ? "border-red-500 bg-red-800" : "border-red-600 bg-gray-900"}`}>
                    <input {...getInputProps()} />
                    {image ? (
                        <div className="flex items-center justify-center">
                            <img src={URL.createObjectURL(image)} alt="Preview" className="h-24 w-auto rounded-lg" />
                            <p className="ml-4 text-red-300 font-semibold">{image.name}</p>
                        </div>
                    ) : isDragActive ? (
                        <p className="text-red-500 font-bold text-lg">Drop the image here...</p>
                    ) : (
                        <p className="text-red-400 text-lg">Drag & Drop an image or <span className="text-red-500 underline">Click to Browse</span></p>
                    )}
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-900 text-white font-bold py-3 px-5 rounded-xl text-lg tracking-widest transition">
                    {loading ? "Uploading..." : "Submit Article"}
                </button>
            </form>
        </div>
    );
};

export default ArticleUpload;
