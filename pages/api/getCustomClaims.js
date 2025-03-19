import {withMiddleware} from "../../utils/withMiddleware";
import {verifyIdToken} from "../../middleware/auth";

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const user = req.user;

    console.log("user", user)

    const uid = user.user.uid;
    if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const admin = require('../../firebase/adminConfig');

    const auth = await admin.auth();

    try {
        const customClaims = user.user.customClaims || {};

        return res.status(200).json({ customClaims, roles: user });
    } catch (error) {
        console.error("Error fetching custom claims:", error);
        return res.status(500).json({ error: "Failed to fetch custom claims" });
    }
}

export default async function wrappedHandler(req, res) {
    try {
        // Run the middleware first
        await withMiddleware(verifyIdToken)(req, res);
        if (req.authError) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Then run your actual handler
        return await handler(req, res);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}