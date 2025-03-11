const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const serviceAccount = require("./heavy-local-admin.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'heavy-local-12bc4', // Replace with your Firebase Storage bucket URL
    databaseURL: 'https://heavy-local-12bc4-default-rtdb.firebaseio.com', // Replace with your Firebase Realtime Database URL
});

exports.addUserToDatabase = functions.identity.beforeUserCreated(async (event) => {
    try {
        const user = event.data;
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName?user.displayName : "New User",
            photoURL: user.photoURL || "",
            createdAt: admin.database.ServerValue.TIMESTAMP,
        };

        const userRef = admin.database().ref(`users/${user.uid}`);

        // ✅ Remove `{ merge: true }` since it's not supported in Realtime Database
        await userRef.set(userData);
        console.log(`✅ Successfully added user ${user.uid} to the database.`);
        return null;
    } catch (error) {
        console.error("❌ Error adding user to database:", error);
        throw new functions.https.HttpsError("internal", "Failed to add user to database.");
    }
});

exports.syncNewUserToDatabase = functions.identity.beforeUserSignedIn({ timeoutSeconds: 540 }, async (event) => {
    try {
        const user = event.data;
        const ipAddress = event.ipAddress;

        if (!user) return null;

        const apiKey = process.env.IP;
        if (!apiKey) {
            console.error("❌ Missing API key for IP lookup");
            return null;
        }

        // Fetch IP details
        const url = `https://api.whatismyip.com/ip-address-lookup.php?key=${apiKey}&input=${ipAddress}`;
        const response = await axios.get(url);
        const textResponse = response.data;

        // Convert text response to JSON format
        const jsonResponse = textResponse.split("\n").reduce((obj, line) => {
            const [key, ...valueParts] = line.split(":");
            if (key && valueParts.length) {
                obj[key.trim()] = valueParts.join(":").trim();
            }
            return obj;
        }, {});

        console.log(`Updating IP data for user: ${user.uid}`);
        console.log(jsonResponse);

        const userRef = admin.database().ref(`users/${user.uid}`);

        // ✅ Remove undefined values recursively
        function removeUndefined(obj) {
            if (Array.isArray(obj)) {
                return obj.map(removeUndefined);
            } else if (obj !== null && typeof obj === "object") {
                return Object.fromEntries(
                    Object.entries(obj)
                        .filter(([_, value]) => value !== undefined)
                        .map(([key, value]) => [key, removeUndefined(value)])
                );
            }
            return obj;
        }

        // ✅ Ensure only valid user data is stored
        const cleanedUser = removeUndefined(user);
        await userRef.set(cleanedUser);

        const ipRef = admin.database().ref(`users/${user.uid}/ip`);
        await ipRef.push({
            loginAttempt: jsonResponse,
            timestamp: admin.database.ServerValue.TIMESTAMP,
        });

        return null;
    } catch (error) {
        console.error("❌ Error syncing user to database:", error);
        return null;
    }
});

exports.updateLatestArticlesV2 = functions
    .database.onValueUpdated('/articlesList/',async (event)=> {
        await updateLatestArticles();
    })

const getSevenDaysAgo = () => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    return today;
};

const updateLatestArticles = async () => {
    try {
        const articlesListSnapshot = await admin.database().ref(`/articlesList`).once('value');
        const articlesList = articlesListSnapshot.val() || {};

        const sevenDaysAgo = getSevenDaysAgo();
        const latestArticles = {};

        // Iterate over each directory in articlesList
        Object.entries(articlesList).forEach(([directory, categories]) => {
            latestArticles[directory] = latestArticles[directory] || {};

            // Iterate over each category
            Object.entries(categories).forEach(([category, articles]) => {
                const recentArticles = {};

                // Filter articles within the last 7 days
                Object.entries(articles).forEach(([filename, articleData]) => {
                    const articleDate = new Date(articleData.date); // Assuming format is YYYY-MM-DD
                    if (articleDate >= sevenDaysAgo) {
                        recentArticles[filename] = articleData;
                    }
                });

                // If recent articles found for the category, add them to latestArticles
                if (Object.keys(recentArticles).length > 0) {
                    latestArticles[directory][category] = recentArticles;
                }
            });
        });

        // Store latest articles in /articlesListLatest
        await admin.database().ref(`/articlesListLatest`).set(latestArticles);

        console.log("Updated articlesListLatest with the last 7 days of articles.");
    } catch (error) {
        console.error("Error updating articlesListLatest:", error);
    }
};
