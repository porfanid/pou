import {checkActionCode, applyActionCode, sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../../firebase/config";
import {router} from "next/client";

function EmailChangeNotification({ setSuccessMessage, setErrorMessage, oobCode }) {

    const handleResetEmail = async () => {
        try {
            const info = await checkActionCode(auth, oobCode);
            const restoredEmail = info['data']['email']
            await applyActionCode(auth, actionCode);
            await sendPasswordResetEmail(auth, restoredEmail);
            setSuccessMessage("Email change successful. You can now sign in with the new email.");
            setTimeout(() => router.push("/login"), 3000); // Redirect after success
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
            <p className="text-white">Your sign-in email was changed. If you didn’t ask to change your email, please follow this link to reset your sign-in email.</p>
            <button
                onClick={handleResetEmail}
                className="w-full bg-gradient-to-r from-red-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-800 transition duration-300"
            >
                Reset Your Email
            </button>
        </div>
    );
}

export default EmailChangeNotification;
