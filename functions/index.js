const functions = require("firebase-functions/v2");
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
    .database.onValueWritten('/articlesList/',async (event)=> {
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
        await Promise.all(Object.entries(articlesList).map(async ([directory, categories]) => {
            latestArticles[directory] = latestArticles[directory] || {};

            // Iterate over each category
            await Promise.all(Object.entries(categories).map(async ([category, articles]) => {
                const recentArticles = {};

                // Filter articles within the last 7 days
                await Promise.all(Object.entries(articles).map(async ([filename, articleData]) => {
                    const articleDate = new Date(articleData.date); // Assuming format is YYYY-MM-DD
                    if (articleDate >= sevenDaysAgo) {
                        recentArticles[filename] = articleData;
                    }
                    if(articleData.translatedBy){
                        const translatorPath = `users/${articleData.translatedBy}/writtenArticles/${directory}/${category}`;
                        await admin.database().ref(translatorPath).child(filename).set(articleData);
                    }else {
                        if (articleData.sub || articleData.author) {
                            const authorPath = `users/${articleData.sub || articleData.author}/writtenArticles/${directory}/${category}`;
                            await admin.database().ref(authorPath).child(filename).set(articleData);
                        }
                    }
                }));

                // If recent articles found for the category, add them to latestArticles
                if (Object.keys(recentArticles).length > 0) {
                    latestArticles[directory][category] = recentArticles;
                }
            }));
        }));

        // Store latest articles in /articlesListLatest
        await admin.database().ref(`/articlesListLatest`).set(latestArticles);

        console.log("Updated articlesListLatest with the last 7 days of articles.");
    } catch (error) {
        console.error("Error updating articlesListLatest:", error);
    }
};

async function updateCloudflareRecords(oldUsername, newUsername, userId) {
    // Your Cloudflare API credentials
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
    const cloudflareApiToken = process.env.CLOUDFLARE_API_KEY;

    // Delete the old CNAME record
    const oldRecordId = await getDnsRecordId(oldUsername, cloudflareZoneId, cloudflareApiToken);
    if (oldRecordId) {
        await axios.delete(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records/${oldRecordId}`, {
            headers: {
                'Authorization': `Bearer ${cloudflareApiToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    const newRecordId = await getDnsRecordId(newUsername, cloudflareZoneId, cloudflareApiToken);
    if (!newRecordId) {
        // Add the new CNAME record
        await axios.post(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records`, {
            type: 'CNAME',
            name: `${newUsername}.pulse-of-the-underground.com`,
            content: 'pulse-of-the-underground.com',
            proxied: true
        }, {
            headers: {
                'Authorization': `Bearer ${cloudflareApiToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Update the redirect list
    await updateRedirectList(oldUsername, newUsername, userId);
}

async function updateRedirectList() {
    const redirectListId = '8038d5ea7f384e70a7a48f6b88095ca8';
    const cloudflareApiToken = process.env.CLOUDFLARE_API_KEY;
    const cloudflareAccountId = "515a4c1253b30f8541443c98c0cb7ee5";

    // Step 1: Read all usernames and user IDs from the Realtime Database
    const usersSnapshot = await database.ref('users').once('value');
    const usersData = usersSnapshot.val();

    let redirects = [];

    // Step 2: Construct the redirect list from the database data
    Object.keys(usersData).forEach(userId => {
        const username = usersData[userId].username;
        if (!username) {
            return;
        }

        const newRedirect = {
            "redirect": {
                "source_url": `${username}.pulse-of-the-underground.com/`,
                "target_url": `https://pulse-of-the-underground.com/author/${userId}`
            }
        }

        redirects.push(newRedirect);
    })

    console.log(redirects);

    // Step 3: Update the entire list in Cloudflare
    try {
        await axios.put(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/rules/lists/${redirectListId}/items`,
            redirects
            , {
                headers: {
                    'Authorization': `Bearer ${cloudflareApiToken}`,
                    'Content-Type': 'application/json'
                }
            });

        console.log('Redirect list successfully updated in Cloudflare.');
    } catch (error) {
        console.error('Error updating redirect list in Cloudflare:', error.response ? error.response.data : error.message);
    }
}


async function getDnsRecordId(username, zoneId, apiToken) {
    const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        params: {
            name: `${username}.pulse-of-the-underground.com`,
            type: 'CNAME'
        }
    });

    const records = response.data.result;
    return records.length > 0 ? records[0].id : null;
}

const updateUsernameFunction = async (change, context) => {
    const oldUsername = change.before.val();
    const newUsername = change.after.val();
    const userId = context.params.userId;

    if (oldUsername !== newUsername) {
        // Update Cloudflare CNAME and redirect list
        await updateCloudflareRecords(oldUsername, newUsername, userId);
    }
};

exports.updateUsernameV2 = functions.database.onValueWritten('/users/{userId}/username', updateUsernameFunction);

