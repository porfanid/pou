import admin from 'firebase-admin';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize the Secret Manager client
const client = new SecretManagerServiceClient();

// Function to retrieve secrets
async function getSecret(secretName) {
    try {
        const [accessResponse] = await client.accessSecretVersion({
            name: `projects/1095342862820/secrets/${secretName}/versions/latest`,
        });
        return accessResponse.payload.data.toString();
    } catch (error) {
        console.error('Error accessing secret:', error);
        throw new Error('Failed to access secret.');
    }
}

// Firebase initialization function
let firebaseInitialized = false; // Flag to ensure initialization happens only once

export async function initializeFirebase() {
    if (firebaseInitialized) return admin; // Return the already initialized admin instance

    let serviceAccount;
    try {
        // Fetch the service account from Secret Manager
        const secret = await getSecret('admin-account');
        serviceAccount = JSON.parse(secret);
    } catch (error) {
        console.error('Failed to fetch secret, falling back to local file:', error);
        try {
            serviceAccount = (await import('./heavy-local-admin.json')).default;
            console.log("Imported the file");
        } catch (error) {
            console.error('Failed to load local service account file:', error);
            throw new Error('Failed to initialize Firebase in development.');
        }
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'heavy-local-12bc4', // Replace with your Firebase Storage bucket URL
            databaseURL: 'https://heavy-local-12bc4-default-rtdb.firebaseio.com', // Replace with your Firebase Realtime Database URL
        });
    }

    firebaseInitialized = true;
    return admin; // Return the initialized admin instance
}

// Lazy loading storage and database exports
export const storage = async () => {
    const admin = await initializeFirebase();
    return admin.storage().bucket('heavy-local-12bc4');
};

export const auth = async () => {
    const admin = await initializeFirebase();
    return admin.auth();
};

export const messaging = async () => {
    const admin = await initializeFirebase();
    return admin.messaging();
};


export const database = async () => {
    const admin = await initializeFirebase();
    return admin.database();
};
