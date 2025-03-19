import * as admin from '../../../firebase/adminConfig';
import { ref, get, remove } from 'firebase/database';
import {withMiddleware} from "../../../utils/withMiddleware";
import {verifyIdToken} from "../../../middleware/auth";

async function deleteHandler(){

}

async function handler(req, res, isDeleteAllowed) {
    if (req.method !== 'GET'&&req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
    }
    const database = await admin.database();
    const bucket = await admin.storage();
    const gigRef = ref(database, `gigs/${date}`);

    if(req.method === 'DELETE') {
        if(!isDeleteAllowed){
            return res.status(405).json({ message: 'Method not allowed' });
        }
        const user = req.user;
        if (!user || !user.roles) {
            console.log("Roles:",user.roles)
            return res.status(401).json({ error: 'Unauthorized: Unknown User' });
        }
        if(!user.roles.isGigAdmin) {
            return res.status(403).json({ error: 'Forbidden - Gig admin access required' });
        }
        const [listResult] = await bucket.getFiles({ prefix: `gigs/${date}` });
        const deletePromises = listResult.map(async (itemRef) => {
            try {
                return await itemRef.delete();
            } catch (error) {
                console.error(`Error deleting ${itemRef.name}:`, error);
                return null;
            }
        });
        await Promise.all(deletePromises);
        await remove(gigRef);

        res.status(200).json({
            success: true,
        });
    }



    try {
        // Get gig data from database
        const snapshot = await get(gigRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        const gigData = snapshot.val();

        // Get photos from storage
        const [listResult] = await bucket.getFiles({ prefix: `gigs/${date}` });

        // Filter out thumbnail versions and get download URLs
        const photoPromises = listResult
            .filter((itemRef) => !/_\d{3}x\d{3}\.[a-z]+$/i.test(itemRef.name))
            .map(async (itemRef) => {
                try {
                    return await itemRef.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 });
                } catch (error) {
                    console.error(`Error getting URL for ${itemRef.name}:`, error);
                    return null;
                }
            });

        const photos = (await Promise.all(photoPromises)).filter(Boolean);

        return res.status(200).json({
            gig: {
                title: gigData.title,
                description: gigData.details || gigData.description,
                thumbnail: gigData.thumbnail
            },
            photos
        });
    } catch (error) {
        console.error('Error fetching gig details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// File: pages/api/events/[date].js

export default async function wrappedHandler(req, res) {
    try {
        // Run the middleware first
        await withMiddleware(verifyIdToken)(req, res);

        // Check for authentication error
        if (req.authError) {
            return await handler(req, res, false);
        }

        // Then run your actual handler
        return await handler(req, res, true);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}