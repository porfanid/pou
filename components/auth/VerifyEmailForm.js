import {applyActionCode} from "firebase/auth";
import { auth } from "../../firebase/config";

function VerifyEmailForm({ oobCode, onSuccess, onError }) {
    const handleVerifyEmail = async () => {
        try {
            await applyActionCode(auth, oobCode);
            onSuccess("Email verified successfully!");
        } catch (error) {
            onError(error.message);
        }
    };

    return (
        <div className="text-center">
            <button
                onClick={handleVerifyEmail}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:from-indigo-700 hover:to-purple-800 transition duration-300"
            >
                Verify Email
            </button>
        </div>
    );
}

export default VerifyEmailForm;
