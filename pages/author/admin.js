import React, { useEffect, useState } from "react";
import { database, storage } from "../../firebase/config";
import { get, onValue, ref, update } from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

const AdminSystem = () => {
    const { user, roles } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState({});
    const [authUsers, setAuthUsers] = useState([]);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [roleType, setRoleType] = useState('admin');
    const [usernameInputs, setUsernameInputs] = useState({});
    const [popupMessage, setPopupMessage] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);

    const roleMapping = {
        Author: "author",
        Band: "band",
        Admin: "admin",
        ads:"ads",
        "Author Leader": "authorLeader",
        comments: "comments",
        "Gallery Admin": "galleryAdmin",
        Translator: "translationSystem"
    };

    useEffect(() => {
        if (!user) return;

        // Check if user is an admin
        const isAdmin = roles && roles.admin;

        if (!isAdmin) {
            router.push("/upload");
            return;
        }

        // Fetch authors data
        const usersRef = ref(database, "users");
        const unsubscribeUsers = onValue(usersRef, async (snapshot) => {
            const usersData = snapshot.val() || {};
            const usersWithPhotos = { ...usersData };

            await Promise.all(
                Object.keys(usersData).map(async (key) => {
                    const photoUrlRef = storageRef(storage, `profile_images/${key}_600x600`);
                    try {
                        usersWithPhotos[key].photoURL = await getDownloadURL(photoUrlRef);
                    } catch (e) {
                        console.error(e);
                    }
                })
            );

            setUsers(usersWithPhotos);
        });

        // Fetch all users with their roles
        fetchAllUsers().then();

        return () => {
            unsubscribeUsers();
        };
    }, [user, roles, router]);

    const fetchAllUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setAuthUsers(data.users);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const toggleDisableUser = async (user) => {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        userData.disabled = !userData.disabled;
        await update(userRef, userData);
        alert(`The user has been ${userData.disabled ? "disabled" : "enabled"} successfully!`);
    };

    const handleUsernameChange = (userId, newUsername) => {
        if (newUsername === users[userId]?.username) return;
        const userRef = ref(database, `users/${userId}`);
        update(userRef, { username: newUsername }).then(() => {
            setUsers(prevUsers => ({
                ...prevUsers,
                [userId]: { ...prevUsers[userId], username: newUsername }
            }));
            alert(`Username for ${userId} changed successfully`);
        }).catch(error => console.error("Error updating username:", error));
    };

    const handleUsernameInputChange = (userId, value) => {
        setUsernameInputs(prev => ({ ...prev, [userId]: value }));
    };

    const handleRoleChange = async (role, email, status) => {
        try {
            const response = await fetch('/api/author/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({ targetUid: email, roles: { role }, status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update roles');
            }

            // Refresh the user list to get updated roles
            fetchAllUsers();
        } catch (error) {
            console.error('Error updating roles:', error);
        }
    };

    const addNewUser = async () => {
        if (!newUserEmail || !roleType) {
            alert("Please provide an email and select a role");
            return;
        }

        try {
            const response = await fetch('/api/author/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({
                    targetUid: newUserEmail,
                    roles: { role: roleType },
                    status: true
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add user role');
            }

            setNewUserEmail("");
            alert(`User ${newUserEmail} has been assigned the ${roleType} role successfully!`);
            fetchAllUsers();
        } catch (error) {
            console.error('Error adding user role:', error);
            alert(`Error adding user: ${error.message}`);
        }
    };

    const hasRole = (userClaims, role) => {
        return userClaims&&userClaims.roles && userClaims.roles[role] === true;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            </div>
        );
    }

    if (!user || !roles || !roles.admin) {
        return (
            <div className="container mx-auto mt-10 p-6 bg-red-100 rounded-lg">
                <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
                <p className="text-red-600">You don&#39;t have permission to access this page.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10 px-4">
            <h2 className="text-3xl font-semibold text-white mb-6">User Admin System</h2>
            <hr className="border-gray-700 mb-6" />

            <div className="flex flex-wrap justify-center mb-6">
                <div className="w-full md:w-1/4 mb-4">
                    <h3 className="text-xl font-semibold text-white">Add New User</h3>
                </div>
                <div className="flex flex-wrap justify-center w-full md:w-3/4">
                    <div className="w-full md:w-2/5 mb-4">
                        <input
                            type="text"
                            className="w-full p-2 bg-gray-800 text-white rounded focus:outline-none"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="Enter user email"
                        />
                    </div>
                    <div className="w-1/3 md:w-1/6 mb-4">
                        <select
                            className="w-full p-2 bg-gray-800 text-white rounded"
                            value={roleType}
                            onChange={(e) => setRoleType(e.target.value)}
                        >
                            {Object.keys(roleMapping).map((roleName) => (
                                <option key={roleName} value={roleMapping[roleName]}>
                                    {roleName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/5 mb-4">
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            onClick={addNewUser}
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authUsers.map((authUser) => {
                    const userProfile = users[authUser.uid] || {};
                    const userClaims = authUser.customClaims || {};

                    return (
                        <div key={authUser.uid} className="bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                            {userProfile.photoURL && (
                                <img
                                    src={userProfile.photoURL}
                                    alt={authUser.displayName || authUser.email}
                                    className="w-32 h-32 rounded-full object-cover mb-4"
                                />
                            )}
                            <h3 className="text-xl font-bold text-white mb-2">
                                {authUser.displayName || userProfile.username || "No Name"}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">{authUser.email}</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {Object.keys(roleMapping).map((roleName) => (
                                    hasRole(userClaims, roleMapping[roleName]) && (
                                        <span key={roleName} className="text-xs bg-gray-700 text-white rounded px-2 py-1">
                                            {roleName}
                                        </span>
                                    )
                                ))}
                            </div>

                            {userProfile.username !== undefined && (
                                <>
                                    <input
                                        type="text"
                                        className="w-full mb-2 p-2 bg-gray-700 text-white rounded focus:outline-none"
                                        value={usernameInputs[authUser.uid] || userProfile.username || ""}
                                        onChange={(e) => handleUsernameInputChange(authUser.uid, e.target.value)}
                                        placeholder="Change username"
                                    />

                                    <button
                                        onClick={() => handleUsernameChange(authUser.uid, usernameInputs[authUser.uid] || userProfile.username)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded mb-2"
                                    >
                                        Change Username
                                    </button>
                                </>
                            )}

                            <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
                                {Object.keys(roleMapping).map((roleName) => (
                                    <button
                                        key={roleName}
                                        onClick={() => handleRoleChange(
                                            roleMapping[roleName],
                                            authUser.email,
                                            !hasRole(userClaims, roleMapping[roleName])
                                        )}
                                        className={`px-3 py-1 rounded text-sm w-full
                                            ${hasRole(userClaims, roleMapping[roleName])
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-gray-300 hover:bg-gray-400 text-gray-800"}`}
                                    >
                                        {hasRole(userClaims, roleMapping[roleName])
                                            ? `Remove ${roleName}`
                                            : `Add ${roleName}`}
                                    </button>
                                ))}

                                {userProfile.disabled !== undefined && (
                                    <button
                                        onClick={() => toggleDisableUser({...authUser, ...userProfile})}
                                        className={`px-3 py-1 rounded text-sm w-full
                                            ${userProfile.disabled
                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                            : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"}`}
                                    >
                                        {userProfile.disabled ? "Enable User" : "Disable User"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {show && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">{popupMessage}</h2>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShow(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShow(false)}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSystem;

// Remove the getServerSideProps since we're now fetching data on the client side