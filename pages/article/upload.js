import React, {useState, useCallback, useEffect} from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import DraftEditor from "../../components/editor/editor";
import {convertToRaw, EditorState} from "draft-js";
import Select from "react-select";
import {useAuth} from "../../context/AuthContext";
import {config} from "../../firebase/config";
import { getValue } from "firebase/remote-config";

const ArticleUpload = () => {

    const { user, userAuth, roles } = useAuth();

    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [category, setCategory] = useState("");
    const [language, setLanguage] = useState("en");
    const [socials, setSocials] = useState({ facebook: "", instagram: "", youtube: "", spotify: "" });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [canUpload, setCanUpload] = useState(false);
    const [languageOptions, setLanguageOptions] = useState([]);

    useEffect(() => {
        if(!roles) return;
        if(!roles.isAuthor){
            setMessage({ type: "error", text: "You are not authorized to upload articles." });
            return;
        }
        setCanUpload(true);
    }, [roles]);

    useEffect(() => {
        const languages = getValue(config, "languages").asString();
        const parsedLanguages=Object.entries(JSON.parse(languages)).map(([key, value]) => {
            return{
                value: key,
                label: value
            }
        })
        setLanguageOptions(parsedLanguages);
    }, []);

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
        if(!canUpload) {
            setMessage({ type: "error", text: "You are not authorized to upload articles." });
            return;
        }
        setLoading(true);
        setMessage(null);

        if (!image) {
            setMessage({ type: "error", text: "Please upload an image." });
            setLoading(false);
            return;
        }

        const contentState = editorState.getCurrentContent();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("details", details);
        formData.append("category", category);
        formData.append("lang", language);
        formData.append("socials", JSON.stringify(socials));
        formData.append("image", image);
        formData.append("sub", user.uid);
        formData.append("content", convertToRaw(contentState));

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
        <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-gray-950 text-white rounded-2xl shadow-2xl border border-red-700 mt-10 w-full">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 mb-6 uppercase tracking-widest text-center">Upload Your Metal Article</h2>
            {message && (
                <div className={`p-4 rounded-lg text-center font-bold ${message.type === "success" ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-semibold text-red-400">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Content</label>
                    <DraftEditor setEditorState={setEditorState} editorState={editorState} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-semibold text-red-400">Category</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-2 p-3 w-full bg-gray-900 border border-red-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold text-red-400">Language</label>
                        <Select
                            value={languageOptions.find(option => option.value === language)}
                            onChange={(selectedOption) => setLanguage(selectedOption.value)}
                            options={languageOptions}
                            className="mt-2"
                            classNamePrefix="react-select"
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#1f2937', // Tailwind bg-gray-900
                                    borderColor: '#b91c1c', // Tailwind border-red-600
                                    color: '#f00', // Tailwind text-white
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#1f2937', // Tailwind bg-gray-900
                                    color: '#f00',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: '#ffffff', // Tailwind text-white
                                    backgroundColor: '#1f2937',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected ? '#791c1c' : state.isFocused ? '#471b1b' : '#1f2937', // Tailwind bg-red-600 for selected, darker red for hover, bg-gray-900 for others
                                    color: state.isSelected ? '#ffffff' : '#ffffff', // Tailwind text-white
                                })
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-lg font-semibold text-red-400">Social Media Links</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div {...getRootProps()} className={`mt-4 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${isDragActive ? "border-red-500 bg-red-800" : "border-red-600 bg-gray-900"}`}>
                    <input {...getInputProps()} />
                    {image ? (
                        <div className="flex flex-col items-center">
                            <img src={URL.createObjectURL(image)} alt="Preview" className="h-24 w-auto rounded-lg" />
                            <p className="mt-2 text-red-300 font-semibold">{image.name}</p>
                        </div>
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
