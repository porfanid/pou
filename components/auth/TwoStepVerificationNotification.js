import { useState } from "react";

function TwoStepVerificationNotification({ onRemoveVerification }) {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleRemoveVerification = async () => {
        try {
            onRemoveVerification();
            setSuccessMessage("2-step verification successfully removed.");
        } catch (error) {
            setErrorMessage("An error occurred while removing 2-step verification.");
        }
    };

    return (
        <div className="p-8 rounded-xl shadow-2xl w-full max-w-md bg-black border-4 border-gray-700">
            <h1 className="text-3xl font-extrabold mb-4 text-center text-indigo-600">2-Step Verification Notification</h1>

            {errorMessage && <p className="text-red-600 text-sm font-semibold">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 text-sm font-semibold">{successMessage}</p>}

            <div className="my-4 text-white">
                <p>Hello <strong>%DISPLAY_NAME%</strong>,</p>
                <p>Your account in <strong>%APP_NAME%</strong> has been updated with <strong>%SECOND_FACTOR%</strong> for 2-step verification.</p>
                <p>If you didn't add this 2-step verification, click the link below to remove it.</p>
                <p>
                    <a
                        href="https://pulse-of-the-underground.com/auth/action?mode=action&oobCode=code"
                        className="text-indigo-600"
                    >
                        Remove 2-Step Verification
                    </a>
                </p>
            </div>

            <button
                onClick={handleRemoveVerification}
                className="w-full bg-gradient-to-r from-red-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-800 transition duration-300"
            >
                Remove 2-Step Verification
            </button>
        </div>
    );
}

export default TwoStepVerificationNotification;
