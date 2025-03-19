// pages/api/author/admin.js
import * as admin from '../../../firebase/adminConfig';
import { withMiddleware } from "../../../utils/withMiddleware";
import { verifyIdToken } from "../../../middleware/auth";

async function handler(req, res) {
    if (req.method !== 'POST') {
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

        const { targetUid, roles, status } = req.body;

        if (!targetUid) {
            return res.status(400).json({ error: 'Target user email is required' });
        }

        if (!roles) {
            return res.status(400).json({ error: 'Roles are required' });
        }

        const role = roles.role;

        try {
            // Get user by email
            const userRecord = await auth.getUserByEmail(targetUid);

            // Get current custom claims
            const customClaims = userRecord.customClaims || {};

            // Update the specific role
            if(!customClaims.roles){
                customClaims.roles = {};
            }
            customClaims.roles[role] = status;

            // Set the updated custom claims
            await auth.setCustomUserClaims(userRecord.uid, customClaims);

            return res.status(200).json({
                success: true,
                message: `User ${targetUid} role ${role} updated successfully`
            });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return res.status(404).json({ error: 'User not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
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