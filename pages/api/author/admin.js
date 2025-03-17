// pages/api/updateUserRoles.js
import * as admin from '../../../firebase/adminConfig';

// Initialize Firebase Admin if not already initialized

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the Bearer token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the ID token
        const auth = await admin.auth()
        const decodedToken = await auth.verifyIdToken(idToken);

        // Check if the user is an admin
        if (!decodedToken.roles || !decodedToken.roles.includes('admin')) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        const { targetUid, roles } = req.body;

        if (!targetUid) {
            return res.status(400).json({ error: 'Target user ID is required' });
        }

        // Update custom claims for the target user
        await auth.setCustomUserClaims(targetUid, { roles });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating user roles:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}