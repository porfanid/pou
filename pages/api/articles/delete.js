import * as admin from '../../../firebase/adminConfig';
import { withMiddleware } from '../../../utils/withMiddleware';
import { verifyIdToken } from '../../../middleware/auth';

const deleteImages = async (name) => {
    const storage = await admin.storage();
    const resolutions = [
        "600x300",
        "600x600",
        "800x400",
        "800x600",
        "800x800",
        ""
    ]

    for (const resolution of resolutions) {
        let path;
        if(!resolution) {
            path = storage.file(`images/${name}`)
        }else {
            path = storage.file(`images/${name}_${resolution}`)
        }
        if(!path.exists()){
            continue;
        }
        try{
            await path.delete();
        }catch (e) {
            console.error(e);
        }
    }
}

async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = req.user;

    if (!user || !user.roles) {
        return res.status(401).json({ error: 'Unauthorized: Unknown User' });
    }

    if (!user.roles.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized: Not an Admin' });
    }

    try {
        const { file, folder } = req.body;

        if (!file || !folder) {
            return res.status(400).json({ message: 'Missing required parameters: file or folder' });
        }

        const db = await admin.database();
        const storage = await admin.storage();

        const fileRef = storage.file(`${folder}/${file.slug}.json`);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ message: 'File not found' });
        }

        await fileRef.delete();

        const articlesRef = db.ref(`articlesList/${folder}/${file.category}/${file.slug}`);
        await articlesRef.remove();
        if(!file.img01) {
            await deleteImages(file.slug)
        }

        return res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error in delete article API:', error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}

export default async function wrappedHandler(req, res) {
    try {
        await withMiddleware(verifyIdToken)(req, res);
        return await handler(req, res);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}