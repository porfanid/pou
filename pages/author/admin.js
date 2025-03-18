import React, { useEffect, useState } from "react";
import { database, storage } from "../../firebase/config";
import { get, onValue, ref, update } from "firebase/database";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

const AdminSystem = ({ initialUsers, initialRoles }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers || {});
    const [roles, setRoles] = useState(initialRoles || {});
    const [newUserEmail, setNewUserEmail] = useState("");
    const [role, setRole] = useState('admin');
    const [usernameInputs, setUsernameInputs] = useState({});
    const [popupMessage, setPopupMessage] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const roleMapping = { Author: "admin", Band: "band" };

    useEffect(() => {
        if (!user) return;

        const isAdmin = user.email === "pavlos@orfanidis.net.gr" ||
            (roles.admin && roles.admin.includes(user.email));

        if (!isAdmin) {
            router.push("/upload");
            return;
        }

        const usersRef = ref(database, "authors");
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
            setLoading(false);
        });

        const rolesRef = ref(database, "roles");
        const unsubscribeRoles = onValue(rolesRef, (snapshot) => {
            const rolesData = snapshot.val() || {};
            setRoles(rolesData);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeRoles();
        };
    }, [user, roles.admin, router]);

    const toggleDisableUser = async (user) => {
        const userRef = ref(database, `authors/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        userData.disabled = !userData.disabled;
        await update(userRef, userData);
        alert(`The user has been ${userData.disabled ? "disabled" : "enabled"} successfully!`);
    };

    const handleUsernameChange = (userId, newUsername) => {
        if (newUsername === users[userId]?.username) return;
        const userRef = ref(database, `authors/${userId}`);
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
        console.log("Data:L ",role, email);
        try {
            const response = await fetch('/api//author/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.idToken}`
                },
                body: JSON.stringify({ targetUid: email, roles: { role}, status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update roles');
            }

            const updatedRoles = { ...roles };
            if (!updatedRoles[role]) updatedRoles[role] = [];
            if (updatedRoles[role].includes(email)) {
                updatedRoles[role] = updatedRoles[role].filter(userEmail => userEmail !== email);
            } else {
                updatedRoles[role].push(email);
            }
            setRoles(updatedRoles);
        } catch (error) {
            console.error('Error updating roles:', error);
        }
    };

    const getUserRoles = (email) => {
        return Object.keys(roles).filter(role => roles[role]?.includes(email));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            </div>
        );
    }

    if (!user || (user.email !== "pavlos@orfanidis.net.gr" && (!roles.admin || !roles.admin.includes(user.email)))) {
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
                    Test
                </div>
                <div className="flex flex-wrap justify-center w-full md:w-3/4">
                    <div className="w-full md:w-2/5 mb-4">
                        <input
                            type="text"
                            className="w-full p-2 bg-gray-800 text-white rounded focus:outline-none"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="Enter new author email"
                        />
                    </div>
                    <div className="w-1/3 md:w-1/6 mb-4">
                        <select
                            className="w-full p-2 bg-gray-800 text-white rounded"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
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
                            onClick={async () => {
                                try {
                                    const claims = { [roleMapping[role]]: true };
                                    const result = await setClaims(newUserEmail, true, claims);
                                    alert(result.data.message);
                                } catch (e) {
                                    alert(e.message);
                                }
                            }}
                        >
                            Set Role
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users && Object.keys(users).map((key) => {
                    const user = users[key];
                    const email = user.email;
                    const userRoles = getUserRoles(email);

                    return (
                        <div key={key} className="bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-32 h-32 rounded-full object-cover mb-4"
                                />
                            )}
                            <h3 className="text-xl font-bold text-white mb-2">{user.displayName}</h3>
                            <p className="text-sm text-gray-400 mb-2">{email}</p>
                            <p className="text-xs bg-gray-700 text-white rounded px-2 py-1 mb-4">
                                {userRoles.length > 0 ? userRoles.join(", ") : "Author"}
                            </p>

                            <input
                                type="text"
                                className="w-full mb-2 p-2 bg-gray-700 text-white rounded focus:outline-none"
                                value={usernameInputs[key] || user.username}
                                onChange={(e) => handleUsernameInputChange(key, e.target.value)}
                                placeholder="Change username"
                            />

                            <button
                                onClick={() => handleUsernameChange(key, usernameInputs[key] || user.username)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded mb-2"
                            >
                                Change Username
                            </button>

                            <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
                                {Object.keys(roles).map((roleName) => (
                                    <button
                                        key={roleName}
                                        onClick={() => handleRoleChange(roleName, email, !userRoles.includes(roleName))}
                                        className={`px-3 py-1 rounded text-sm w-full
                            ${userRoles.includes(roleName)
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-gray-300 hover:bg-gray-400 text-gray-800"}`}
                                    >
                                        {userRoles.includes(roleName)
                                            ? `Remove ${roleName}`
                                            : `Add ${roleName}`}
                                    </button>
                                ))}

                                <button
                                    onClick={() => toggleDisableUser(user)}
                                    className={`px-3 py-1 rounded text-sm w-full
                        ${user.disabled
                                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                        : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"}`}
                                >
                                    {user.disabled ? "Enable User" : "Disable User"}
                                </button>
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
                                onClick={() => {
                                    functionToRun(functionArguments).then(() => setShow(false)).catch((e) => alert(e.message));
                                }}
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

// Add getServerSideProps to fetch initial data
export async function getServerSideProps(context) {
    try {
        const admin = require('../../firebase/adminConfig');

        // User is authenticated and an admin, fetch data
        const adminDb = await admin.database();

        // Get users data
        const usersSnapshot = await adminDb.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};

        // Get roles data
        const rolesSnapshot = await adminDb.ref('roles').once('value');
        const rolesData = rolesSnapshot.val() || {};

        console.log("rolesData: ", rolesData);

        console.log("Nepheli");

        // Return the data as props
        return {
            props: {
                initialUsers: usersData,
                initialRoles: rolesData
            }
        };
    } catch (error) {
        console.error("Error in getServerSideProps:", error);
        return { props: { initialUsers: null, initialRoles: null } };
    }
}