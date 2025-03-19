import React, { useState } from 'react';

export default function UploadGig() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState('');
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [filesUploaded, setFilesUploaded] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setTotalFiles(files.length);
        setFilesUploaded(0);
    };

    const handleThumbnailChange = (event) => {
        setThumbnail(event.target.value);
    };

    const handleUpload = async () => {
        if (!date || !title || !description || !selectedFiles.length || !thumbnail) {
            setError('Please fill in all fields and select files.');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        const formattedDate = date.replace(/-/g, '_');

        // Create FormData to send files
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        // Add metadata
        formData.append('date', formattedDate);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('thumbnail', thumbnail);

        try {
            // Use fetch with progress tracking
            const xhr = new XMLHttpRequest();

            xhr.open('POST', '/api/uploadGig', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    setSuccess('Upload and data update successful!');
                    // Reset form
                    setTitle('');
                    setDate('');
                    setDescription('');
                    setThumbnail('');
                    setSelectedFiles([]);
                } else {
                    setError('Server returned an error: ' + xhr.statusText);
                }
                setUploading(false);
            };

            xhr.onerror = function() {
                setError('An error occurred during upload.');
                setUploading(false);
            };

            xhr.send(formData);
        } catch (err) {
            setError('An error occurred during upload: ' + err.message);
            setUploading(false);
        }
    };

    return (
        <div className="mt-6 bg-gray-800 text-white w-3/4 rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold">Upload Images and Data</h2>
            </div>
            <div className="p-6">
                {error && (
                    <div className="bg-red-500 text-white p-3 mb-4 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500 text-white p-3 mb-4 rounded">
                        {success}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2">Select Files</label>
                        <input
                            type="file"
                            multiple
                            directory=""
                            webkitdirectory=""
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Thumbnail</label>
                            <select
                                onChange={handleThumbnailChange}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700"
                            >
                                <option value="">Select Thumbnail</option>
                                {Array.from(new Set(selectedFiles.map(file => file.name))).map((fileName) => (
                                    <option key={fileName} value={fileName}>{fileName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700"
                        />
                    </div>

                    {uploading && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-center mt-2">{Math.round(uploadProgress)}%</p>
                        </div>
                    )}

                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={`px-6 py-2 rounded ${uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}