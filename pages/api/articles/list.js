import  * as admin from '../../../firebase/adminConfig';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { type } = req.query;
        const db = await admin.database();

        // Determine which bucket/folder to query
        let folderPath = 'upload_from_authors/';

        if (type === 'early') {
            folderPath = 'earlyReleases/';
        } else if (type === 'published') {
            folderPath = 'articles/';
        }

        const articleRef = db.ref(`articlesList/${folderPath}`);
        const snapshot = await articleRef.once('value');
        const articles = snapshot.val() || {};


        // Return the files
        return res.status(200).json({ files: articles });
    } catch (error) {
        console.error('Error in list articles API:', error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}