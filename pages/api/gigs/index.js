import * as admin from '../../../firebase/adminConfig';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const database = await admin.database();
        const storage = await admin.storage();
        const gigsRef = database.ref('/gigs');
        const snapshot = await gigsRef.once('value');
        const data = snapshot.val();

        if (!data) {
            console.log("No gigs found");
            return res.status(200).json({ gigs: [] });
        }

        // Process the data
        const gigsList = await Promise.all(
            Object.keys(data).map(async (key) => {
                let thumbnailURL = null;
                try {

                    const thumbnailRef = storage.file(`gigs/${key}/${data[key].thumbnail.replace(/(\.[\w\d_-]+)$/i, '_800x600$1')}`);
                    thumbnailURL = await thumbnailRef.getSignedUrl(
                        { action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 } // 24 hours
                    )
                } catch (error) {
                    console.error(`Error getting thumbnail for gig ${key}:`, error);
                }

                const gig = {
                    date: key,
                    thumbnailURL,
                    title: data[key].title,
                    description: data[key].details || data[key].description,
                }

                console.log(gig)

                return gig;
            })
        );

        return res.status(200).json({ gigs: gigsList });
    } catch (error) {
        console.error('Error fetching gigs:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}