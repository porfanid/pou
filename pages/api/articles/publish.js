import * as admin from '../../../firebase/adminConfig';
import { withMiddleware } from '../../../utils/withMiddleware';
import { verifyIdToken } from '../../../middleware/auth';

async function handler(req, res) {
    if (req.method !== 'POST') {
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
        const { file, toNormal, isEarlyReleased, folder, undo} = req.body;

        if (!file) {
            return res.status(400).json({ message: 'Missing required parameters: file' });
        }

        const db = await admin.database();
        const storage = await admin.storage();

        console.log("Undo", undo)

        let newFolder = 'early_releases';
        if(folder === 'early_releases'||toNormal){
            newFolder = 'articles';
        }

        if(undo){
            newFolder = 'upload_from_authors';
        }

        console.log("Folder", `${folder}/${file.slug}.json`)
        console.log("New Folder", `${newFolder}/${file.slug}.json`)
        console.log("toNormal: ", toNormal)

        const fileRef = storage.file(`${folder}/${file.slug}.json`);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ message: 'File not found' });
        }

        const newFileRef = storage.file(`${newFolder}/${file.slug}.json`);
        await fileRef.move(newFileRef);

        const oldArticlesRef = db.ref(`articlesList/${folder}/${file.category}/${file.slug}`);
        const articleData = (await oldArticlesRef.once('value')).val();
        await oldArticlesRef.remove()
        const articlesRef = db.ref(`articlesList/${newFolder}/${file.category}/${file.slug}`);
        await articlesRef.set(articleData);



        return res.status(200).json({ message: 'Article published successfully' });
    } catch (error) {
        console.error('Error in publish article API:', error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}

export default async function wrappedHandler(req, res) {
    try {
        await withMiddleware(verifyIdToken)(req, res);
        if (req.authError) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return await handler(req, res);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}