export const sendNotification = async (userId) => {
    try {
        const user = await admin.auth().getUserByEmail(userId);
        if (!user) return;

        const message = {
            notification: {
                title: "New Article Submission",
                body: `${user.displayName} uploaded an article for review.`,
            },
            token: user.fcmToken, // Ensure user has an FCM token
        };
        const admin = require("../../firebase/adminConfig");
        const messaging = await admin.messaging();
        await messaging.send(message);
        console.log(`Notification sent to ${user.displayName}`);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
