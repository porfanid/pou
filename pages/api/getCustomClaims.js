export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { uid } = req.body;
    if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const admin = require('../../firebase/adminConfig');

    const auth = await admin.auth();

    try {
        const user = await auth.getUser(uid);
        const customClaims = user.customClaims || {};

        return res.status(200).json({ customClaims });
    } catch (error) {
        console.error("Error fetching custom claims:", error);
        return res.status(500).json({ error: "Failed to fetch custom claims" });
    }
}