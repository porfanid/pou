import React, { useState } from "react";
import { auth, database, functions, storage } from "../../firebase/config";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile, deleteUser } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ref as databaseRef, update, remove } from "firebase/database";
import { useRouter } from "next/router";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to get user and roles

const UserProfile = () => {
    const { user, roles, userAuth } = useAuth(); // Access user and roles from context
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const router = useRouter();

    if (!user || !roles) {
        return null; // or a loading spinner
    }

    const userRef = databaseRef(database, `${roles.isAuthor ? 'authors' : 'users'}/${user.uid}`);

    const handleLogoutAllDevices = async () => {
        try {
            await httpsCallable(functions, 'logoutAllDevices')();
            alert('Successfully logged out of all devices.');
        } catch (error) {
            console.error('Error logging out of all devices:', error);
            alert('Failed to log out of all devices.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            if (profileImage) {
                const imageRef = ref(storage, `profile_images/${user.uid}`);
                await uploadBytes(imageRef, profileImage);
                const imageUrl = await getDownloadURL(imageRef);
                await updateProfile(userAuth, { displayName: displayName.trim(), photoURL: imageUrl });
                setProfileImageUrl(imageUrl);
            } else {
                await updateProfile(userAuth, { displayName: displayName.trim() });
            }

            await update(userRef, { email: user.email, displayName: displayName.trim(), photoURL: user.photoURL || '' });
            setSuccessMessage("Profile updated successfully");
        } catch (error) {
            console.log(error)
            setError("Error: " + error.message);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(userAuth, credential);
            await updatePassword(userAuth, newPassword);
            setSuccessMessage('Password updated successfully');
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteProfile = async () => {
        try {
            // Delete profile from the database
            await remove(userRef);

            // Delete user from Firebase Auth
            await deleteUser(user);

            // Redirect after deletion
            router.push('/'); // Use router.push for navigation after deletion
        } catch (error) {
            console.error('Error deleting profile:', error);
            setError('Failed to delete profile');
        }
    };

    return (
        <div className="container mx-auto mt-4 bg-black text-white p-6 rounded-xl shadow-lg border-4 border-red-800">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold text-metal">User Profile</h1>
                <button
                    onClick={handleLogoutAllDevices}
                    className="bg-red-800 text-white px-6 py-3 rounded-md hover:bg-red-900 transition"
                >
                    Log Out Of All Devices
                </button>
            </div>

            {roles.isAuthor && (
                <div className="flex justify-end mb-4">
                    <label htmlFor="sort-by-date-switch" className="text-white mr-2">Show Profile Picture</label>
                    <input
                        type="checkbox"
                        id="sort-by-date-switch"
                        checked={user.wantToShow}
                        onChange={() => {
                            user.wantToShow = !user.wantToShow;
                            update(userRef, {wantToShow: user.wantToShow}).then();
                        }}
                        className="toggle bg-metal"
                    />
                </div>
            )}

            {error && (
                <div className="bg-red-900 text-white p-3 mb-4 rounded-md shadow-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-700 text-white p-3 mb-4 rounded-md shadow-lg">
                    <strong>Success:</strong> {successMessage}
                </div>
            )}

            <form className="mb-6" onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                    <label htmlFor="displayName" className="block text-lg">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="file"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        className="bg-gray-800 text-white p-3 rounded-md w-full border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900 transition"
                >
                    Update Profile
                </button>
            </form>

            <form onSubmit={handleUpdatePassword}>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-lg">Current Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-lg">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-lg">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900 transition"
                >
                    Update Password
                </button>
            </form>

            <button
                onClick={handleDeleteProfile}
                className="bg-red-800 text-white px-6 py-3 rounded-md mt-6 hover:bg-red-900 transition"
            >
                Delete Profile
            </button>
        </div>
    );
};

export default UserProfile;
