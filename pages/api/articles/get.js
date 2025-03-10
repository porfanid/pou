import  * as admin from '../../../firebase/adminConfig';
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, folder } = req.query;

        if (!name || !folder) {
            return res.status(400).json({ message: 'Missing required parameters: name or folder' });
        }

        const db = await admin.database();
        const storage = await admin.storage();

        console.log(`${folder}/${name}.json`);

        // Get the file from storage
        const file = storage.file(`${folder}/${name}.json`);
        const [exists] = await file.exists();

        if (!exists) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Get signed URL
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 10 * 60 * 1000, // 10 minutes
        });

        // Fetch file content
        const response = await fetch(url);
        const fileData = await response.json();

        // Get author name from database
        let authorName = '';
        if (fileData.sub) {
            const authorSnapshot = await db.ref(`authors/${fileData.sub}`).once('value');
            if (authorSnapshot.exists()) {
                authorName = authorSnapshot.val().displayName || '';
            }
        }

        // Return the file data and author name
        return res.status(200).json({ fileData, authorName });
    } catch (error) {
        console.error('Error in get article API:', error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}