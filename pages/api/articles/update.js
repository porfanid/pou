import  * as admin from '../../../firebase/adminConfig';
import {withMiddleware} from "../../../utils/withMiddleware";
import {verifyIdToken} from "../../../middleware/auth";

const renameImages = async (oldName, newName) => {
    const storage = await admin.storage();
    console.log("oldName", oldName);
    console.log("newName", newName);
    const resolutions = [
        "600x300",
        "600x600",
        "800x400",
        "800x600",
        "800x800",
        ""
    ]

    for (const resolution of resolutions) {
        let oldPath;
        let newPath;
        if(!resolution) {
            oldPath = storage.file(`images/${oldName}`)
            newPath = storage.file(`images/${newName}`)
        }else {
            oldPath = storage.file(`images/${oldName}_${resolution}`)
            newPath = storage.file(`images/${newName}_${resolution}`)
        }
        if(!oldPath.exists()){
            continue;
        }
        try{
            await oldPath.move(newPath);
        }catch (e) {
            console.error(e);
        }
    }
}

async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = req.user;

    if(!user||!user.roles){
        return res.status(401).json({ error: 'Unauthorized: Unknown User' });
    }

    if(!user.roles.isAuthor&&!user.roles.isAdmin){
        return res.status(401).json({ error: 'Unauthorized: Not an Author' });
    }

    try {
        const { file, fileData, oldData, folder } = req.body;

        if (!file || !fileData || !oldData || !folder) {
            return res.status(400).json({ message: 'Missing required parameters: file or fileData' });
        }

        const db = await admin.database();
        const storage = await admin.storage();

        console.log(`${folder}/${oldData.file.slug}`)
        console.log(`${folder}/${file.slug}`)

        // Update the file in storage
        const fileRef = storage.file(`${folder}/${oldData.file.slug}.json`);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Upload updated file data
        await fileRef.save(JSON.stringify(fileData), {
            contentType: 'application/json',
            metadata: {
                cacheControl: 'public, max-age=300',
            }
        });

        delete fileData.content;

        const oldRef = db.ref(`articlesList/${folder}/${oldData.file.category}/${oldData.file.slug}`)
        await oldRef.remove()
        const newRef = db.ref(`articlesList/${folder}/${fileData.category}/${fileData.slug}`)
        await newRef.set(fileData)

        if(oldData.data.fileData.slug!==fileData.slug){
            const newFileRef = storage.file(`${folder}/${fileData.slug}.json`);
            await fileRef.move(newFileRef);
            if(!fileData.img01){
                await renameImages(oldData.file.slug, fileData.slug)
            }
        }

        return res.status(200).json({ message: 'File updated successfully' });
    } catch (error) {
        console.error('Error in update article API:', error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
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