import * as admin from '../../../firebase/adminConfig';
import { ref, get } from 'firebase/database';
import { getStorage, ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
    }

    try {
        const database = await admin.database();
        // Get gig data from database
        const gigRef = ref(database, `gigs/${date}`);
        const snapshot = await get(gigRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        const gigData = snapshot.val();

        // Get photos from storage
        const bucket = await admin.storage();
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