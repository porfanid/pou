// pages/api/updateUserRoles.js
import * as admin from '../../../firebase/adminConfig';
import {withMiddleware} from "../../../utils/withMiddleware";
import {verifyIdToken} from "../../../middleware/auth";

// Initialize Firebase Admin if not already initialized

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the Bearer token from the Authorization header
        const auth = await admin.auth();
        const database = await admin.database();

        const user = req.user;

        if(!user||!user.roles){
            return res.status(401).json({ error: 'Unauthorized: Unknown User' });
        }

        if(!user.roles.isAdmin){
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        const { targetUid, roles, status } = req.body;

        if (!targetUid) {
            return res.status(400).json({ error: 'Target user ID is required' });
        }

        if (!roles) {
            return res.status(400).json({ error: 'Roles are required' });
        }

        const role = roles.role;
        const targetEmail = targetUid;

        const currentRoles = (await database.ref(`roles/${role}`).once('value')).val();

        if(!status){
            if (!currentRoles) {
                return res.status(400).json({ error: 'Role does not exist' });
            }
            const newRoles = currentRoles.filter((email) => email !== targetEmail);
            await database.ref(`roles/${role}`).set(newRoles);
            return res.status(200).json({ success: true });
        }

        let newRoles;
        if (!currentRoles) {
            newRoles=[targetEmail];
        }else{
            newRoles = [...currentRoles, targetEmail];
        }

        await database.ref(`roles/${role}`).set(newRoles);


        // Update custom claims for the target user
        const targetUser = auth.getUserByEmail(targetUid);
        //await auth.setCustomUserClaims(targetUser, { roles });

        console.log("roles", role);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating user roles:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

export default async function wrappedHandler(req, res) {
    try {
        // Run the middleware first
        await withMiddleware(verifyIdToken)(req, res);

        // Then run your actual handler
        return await handler(req, res);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}