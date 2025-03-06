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

    const { uid, email, displayName, photoURL } = event.data;
    const userData = {
        uid,
        email,
        displayName: displayName || "New User",
        photoURL: photoURL || "",
        createdAt: admin.database.ServerValue.TIMESTAMP,
    };
    const userRef = admin.database().ref(`users/${user.uid}`)
    const data = userRef.set(userData, { merge: true });
    data.then(console.log).catch(console.error);
});

exports.syncNewUserToDatabase = functions.identity.beforeUserSignedIn({timeoutSeconds: 540}, async (event) => {
    //user, context
    const user = event.data;
    const ipAddress = event.ipAddress;


    if(!user) return;
    const apiKey = process.env.IP;


    const url = `https://api.whatismyip.com/ip-address-lookup.php?key=${apiKey}&input=${ipAddress}`;
    const response = await axios.get(url);
    const textResponse = response.data;
    const jsonResponse = textResponse.split('\n').reduce((obj, line) => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            obj[key.trim()] = valueParts.join(':').trim();
        }
        return obj;
    }, {});

    console.log(`users/${user.uid}/ip`);
    console.log(jsonResponse)




    const ref = admin.database().ref(`users/${user.uid}/ip`);
    await ref.push({
        loginAttempt: jsonResponse
    });
});
