import { onAuthUserCreate, onAuthUserSignIn } from "firebase-functions/v2/identity";
import { getDatabase, ServerValue } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import axios from "axios";

initializeApp();

const IP_API_KEY = process.env.IP_API_KEY; // Load from .env

export const syncNewUserToDatabase = onAuthUserCreate(async (event) => {
    const { uid, email, displayName, photoURL } = event.data;

    const userData = {
        uid,
        email,
        displayName: displayName || "New User",
        photoURL: photoURL || "",
        createdAt: ServerValue.TIMESTAMP,
    };

    try {
        await getDatabase().ref(`users/${uid}`).set(userData);
        console.log(`✅ User ${uid} synced to database.`);
    } catch (error) {
        console.error(`❌ Error syncing user ${uid}:`, error);
    }
});

export const logLoginAttempt = onAuthUserSignIn(async (event) => {
    const { uid, ipAddress } = event.data;
    if (!uid || !ipAddress) return;

    try {
        const url = `https://api.whatismyip.com/ip-address-lookup.php?key=${IP_API_KEY}&input=${ipAddress}`;
        const response = await axios.get(url);

        // Convert response to JSON
        const locationData = response.data.split("\n").reduce((obj, line) => {
            const [key, ...valueParts] = line.split(":");
            if (key && valueParts.length) {
                obj[key.trim()] = valueParts.join(":").trim();
            }
            return obj;
        }, {});

        // Save login attempt to Firebase
        await getDatabase().ref(`users/${uid}/logins`).push({
            loginAttempt: locationData,
            timestamp: ServerValue.TIMESTAMP,
        });

        console.log(`✅ Login attempt logged for user ${uid}`);
    } catch (error) {
        console.error(`❌ Error logging login attempt for user ${uid}:`, error);
    }
});
