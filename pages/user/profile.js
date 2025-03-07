import React, { useState, useEffect } from "react";
import { database, storage } from "../../firebase/config";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    updateProfile,
    deleteUser,
    signOut,
    updateEmail,
    sendEmailVerification
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ref as databaseRef, update, remove, get } from "firebase/database";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
    const { user, userAuth, roles } = useAuth();

    const [displayName, setDisplayName] = useState(user ? user.displayName : "");
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(user ? user.profileImage : "");
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [shippingAddress, setShippingAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const [userRef, setUserRef] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        const userRef = databaseRef(database, `users/${user.uid}`);
        setUserRef(userRef);
    }, [user]);

    const handleReauthenticate = async (currentPassword) => {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        try {
            await reauthenticateWithCredential(userAuth, credential);
            return true; // Reauthentication successful
        } catch (error) {
            setError("Reauthentication failed. Please check your password.");
            return false; // Reauthentication failed
        }
    };

    const handleDeleteProfile = async (currentPassword) => {
        try {
            const reauthenticated = await handleReauthenticate(currentPassword);
            if (!reauthenticated) return;

            // Delete profile from the database
            await remove(userRef);

            // Delete user from Firebase Auth
            await deleteUser(userAuth);
            await signOut(userAuth);

            // Redirect after deletion
            router.push('/');
        } catch (error) {
            console.error("Error deleting profile:", error);
            setError("Failed to delete profile.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const userRef = databaseRef(database, `users/${user.uid}`);
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

            await update(userRef, { displayName: displayName.trim(), photoURL: user.photoURL || '' });
            setSuccessMessage("Profile updated successfully");
        } catch (error) {
            setError("Error: " + error.message);
        }
    };

    const handleUpdatePassword = async (currentPassword) => {
        const reauthenticated = await handleReauthenticate(currentPassword);
        if (!reauthenticated) return;

        try {
            await updatePassword(userAuth, newPassword);
            setSuccessMessage("Password updated successfully");
        } catch (error) {
            setError("Error updating password: " + error.message);
        }
    };

    const handleUpdateEmail = async (currentPassword) => {
        setError(null)
        const reauthenticated = await handleReauthenticate(currentPassword);
        if (!reauthenticated) return;

        try {
            await updateEmail(userAuth, newEmail);
            await sendEmailVerification(userAuth);
            setSuccessMessage("Email updated successfully");
        } catch (error) {
            setError("Error updating email: " + error.message);
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user) return;
                console.log(user)
                const userRef = databaseRef(database, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    console.log("User data have been fetched");
                    const userData = snapshot.val();
                    setDisplayName(userData.displayName || '');
                    if (userData.shipping) {
                        setShippingAddress(userData.shipping.address || '');
                        setCity(userData.shipping.city || '');
                        setPostalCode(userData.shipping.postalCode || '');
                        setCountry(userData.shipping.country || '');
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData().then();
    }, [user]);

    return (
        <div className="container mx-auto mt-4 bg-black text-white p-6 rounded-xl shadow-lg border-4 border-red-800">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold text-metal">User Profile {user?user.email:""}</h1>
            </div>

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

            {/* Profile Update Form */}
            <form className="mb-6" onSubmit={handleUpdateProfile}>
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
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

            {/* Change Password Form */}
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePassword(currentPassword);
            }}>
                <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-lg">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                <button
                    type="submit"
                    className="bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900 transition"
                >
                    Change Password
                </button>
            </form>

            {/* Change Email Form */}
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEmail(currentPassword);
            }}>
                <h2 className="text-2xl font-bold mb-4">Change Email</h2>
                <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-lg">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="newEmail" className="block text-lg">New Email</label>
                    <input
                        type="email"
                        id="newEmail"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-gray-800 text-white p-3 rounded-md w-full mt-2 border-2 border-red-600 focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-900 transition"
                >
                    Change Email
                </button>
            </form>

            <button
                onClick={() => handleDeleteProfile(currentPassword)}
                className="bg-red-800 text-white px-6 py-3 rounded-md mt-6 hover:bg-red-900 transition"
            >
                Delete Profile
            </button>
        </div>
    );
};

export default UserProfile;
