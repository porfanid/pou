import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { database } from "../../firebase/config";
import { ref, update } from "firebase/database";

const Notifications = () => {
    const { user, notifications } = useAuth(); // Fetch user and notifications from context
    const [userNotifications, setUserNotifications] = useState([]);

    useEffect(() => {
        if (notifications) {
            setUserNotifications(notifications);
        }
    }, [notifications]);

    // Mark a notification as read
    const markAsRead = async (index) => {
        const updatedNotifications = userNotifications.map((notif, i) =>
            i === index ? { ...notif, read: true } : notif
        );
        setUserNotifications(updatedNotifications);

        // Update in Firebase
        if (user) {
            const userRef = ref(database, `users/${user.uid}/notifications`);
            await update(userRef, updatedNotifications);
        }
    };

    // Clear all notifications
    const clearNotifications = async () => {
        setUserNotifications([]);

        // Remove notifications from Firebase
        if (user) {
            const userRef = ref(database, `users/${user.uid}/notifications`);
            await update(userRef, []);
        }
    };

    return (
        <div className="container mx-auto mt-4 bg-black text-white p-6 rounded-xl shadow-lg border-4 border-blue-800">
            <h1 className="text-4xl font-bold mb-4">Notifications</h1>

            {userNotifications.length === 0 ? (
                <p className="text-gray-400">No new notifications.</p>
            ) : (
                <ul className="divide-y divide-gray-700">
                    {userNotifications.map((notif, index) => (
                        <li key={index} className={`p-4 ${notif.read ? "opacity-50" : ""}`}>
                            <p className="text-lg">{notif.message}</p>
                            <p className="text-sm text-gray-400">{new Date(notif.timestamp).toLocaleString()}</p>
                            {!notif.read && (
                                <button
                                    onClick={() => markAsRead(index)}
                                    className="mt-2 bg-green-700 px-4 py-2 rounded-md hover:bg-green-800 transition"
                                >
                                    Mark as Read
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {userNotifications.length > 0 && (
                <button
                    onClick={clearNotifications}
                    className="mt-4 bg-red-800 px-6 py-3 rounded-md hover:bg-red-900 transition"
                >
                    Clear All Notifications
                </button>
            )}
        </div>
    );
};

export default Notifications;
