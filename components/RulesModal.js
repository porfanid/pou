import { useState } from "react";

const RulesModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-80">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg max-w-2xl w-full border border-gray-700">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Community Rules</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>No hate speech, discrimination, or harassment.</li>
                    <li>Respect all users and their opinions.</li>
                    <li>No spamming, advertising, or self-promotion.</li>
                    <li>Keep discussions relevant and constructive.</li>
                    <li>Report inappropriate content instead of engaging.</li>
                    <li>Breaking these rules may result in comment removal.</li>
                </ul>
                <button
                    onClick={onClose}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default RulesModal;
