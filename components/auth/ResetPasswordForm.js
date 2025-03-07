import { useState } from "react";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebase/config";

function ResetPasswordForm({ oobCode, onSuccess, onError }) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            onError("Passwords do not match.");
            return;
        }
        try {
            await verifyPasswordResetCode(auth, oobCode);
            await confirmPasswordReset(auth, oobCode, newPassword);
            onSuccess("Password reset successfully!");
        } catch (error) {
            onError(error.message);
        }
    };

    return (
        <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
                <label className="text-white">New Password</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
            </div>
            <div>
                <label className="text-white">Confirm New Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-800 transition duration-300"
            >
                Reset Password
            </button>
        </form>
    );
}

export default ResetPasswordForm;
