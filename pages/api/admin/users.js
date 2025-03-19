// pages/api/admin/users.js
import * as admin from '../../../firebase/adminConfig';
import { withMiddleware } from "../../../utils/withMiddleware";
import { verifyIdToken } from "../../../middleware/auth";

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const auth = await admin.auth();

        const user = req.user;

        if (!user || !user.roles) {
            return res.status(401).json({ error: 'Unauthorized: Unknown User' });
        }

        if (!user.roles.isAdmin) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        // List all users with their custom claims
        const listUsersResult = await listAllUsers(null, auth);

        return res.status(200).json({
            success: true,
            users: listUsersResult
        });
    } catch (error) {
        console.error('Error listing users:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

// Helper function to list all users with pagination
async function listAllUsers(nextPageToken, auth) {
    let result;
    if (!nextPageToken) {
        result = await auth.listUsers(1000);
    } else {
        result = await auth.listUsers(1000, nextPageToken);
    }

    const users = result.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        customClaims: user.customClaims || {}
    }));

    if (result.pageToken) {
        // List next batch of users
        const nextBatch = await listAllUsers(result.pageToken, auth);
        return users.concat(nextBatch);
    }

    return users;
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