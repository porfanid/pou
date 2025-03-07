import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import VerifyEmailForm from "../../components/auth/VerifyEmailForm";
import EmailChangeNotification from "../../components/auth/EmailChangeNotification";

export default function ActionPage() {
    const router = useRouter();
    const { mode, oobCode } = router.query;

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => router.push("/login"), 3000); // Redirect after success
    };

    const handleError = (message) => {
        setErrorMessage(message);
    };

    return (
        <div className="flex items-center justify-center py-8 min-h-screen w-full">
            <div className="p-8 rounded-xl shadow-2xl w-fit bg-black border-4 border-gray-700 text-white">
                <h1 className="text-4xl font-extrabold mb-4 text-center text-indigo-600 uppercase">
                    {mode === "resetPassword"
                        ? "Reset Password"
                        : mode === "verifyEmail"
                            ? "Verify Email"
                            : "Email Change Notification"}
                </h1>

                {errorMessage && <p className="text-red-600 text-lg">{errorMessage}</p>}
                {successMessage && <p className="text-green-500 text-lg">{successMessage}</p>}

                {mode === "resetPassword" && (
                    <ResetPasswordForm oobCode={oobCode} onSuccess={handleSuccess} onError={handleError} />
                )}
                {mode === "verifyEmail" && (
                    <VerifyEmailForm oobCode={oobCode} onSuccess={handleSuccess} onError={handleError} />
                )}
                {mode === "recoverEmail" && (
                    <EmailChangeNotification
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                        oobCode={oobCode}
                    />
                )}
            </div>
        </div>
    );
}
