"use client";

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvKorfS7r3u8PVcq4O3jWf_yF--mYsZ6c",
    authDomain: "pulse-of-the-underground.com",
    databaseURL: "https://heavy-local-12bc4-default-rtdb.firebaseio.com",
    projectId: "heavy-local-12bc4",
    storageBucket: "heavy-local-12bc4",
    messagingSenderId: "1095342862820",
    appId: "1:1095342862820:web:641656e6dff630f438d7f1",
    measurementId: "G-K1TR05V7PB",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let config, firestore, analytics, storage, auth, database, functions, firebaseMessaging;
storage = getStorage(app);
if (typeof window !== "undefined") {
    config = getRemoteConfig(app);
    firestore = getFirestore(app);
    analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

    auth = getAuth(app);
    database = getDatabase(app);
    functions = getFunctions(app);

    // Firebase App Check setup
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdI_sMpAAAAADFJGDiXfkFW4VPap3M_YDFN2cwi'),
        isTokenAutoRefreshEnabled: true // Enable debug mode (optional)
    });

    // Service Worker Support (for messaging)
    const isServiceWorkerSupported = () => 'serviceWorker' in navigator;
    const isNotificationSupported = () => 'Notification' in window;
    if (isServiceWorkerSupported() && isNotificationSupported()) {
        firebaseMessaging = getMessaging(app);
    }

    // Emulator setup (only in development)
    const isDev = process.env.NODE_ENV === 'development';
    const useEmulators = process.env.REACT_APP_USE_EMULATORS === 'true';
    if (isDev && useEmulators) {
        const EMULATOR_HOST = "localhost";
        connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`);
        connectDatabaseEmulator(database, EMULATOR_HOST, 9001);
        connectFirestoreEmulator(firestore, EMULATOR_HOST, 8081);
        connectStorageEmulator(storage, EMULATOR_HOST, 9199);
        connectFunctionsEmulator(functions, EMULATOR_HOST, 8443);
    }


}

// Cloud Functions for Firebase
const sendPushoverNotification = functions ? httpsCallable(functions, 'sendPushoverNotification') : null;
const handlePublishFunction = functions ? httpsCallable(functions, 'handlePublish') : null;
const getYoutubeVideos = functions ? httpsCallable(functions, 'getYoutubeVideos') : null;
const generateRecording = functions ? httpsCallable(functions, 'generateRecording') : null;

// Export the initialized services
export {
    app,
    config,
    firestore,
    analytics,
    storage,
    auth,
    database,
    functions,
    firebaseMessaging as messaging,
    sendPushoverNotification,
    handlePublishFunction,
    getYoutubeVideos,
    generateRecording
};