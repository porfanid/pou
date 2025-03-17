// This file would be placed in /pages/api/articles/create-translation.js
import  * as admin from '../../../firebase/adminConfig';
import {withMiddleware} from "../../../utils/withMiddleware";
import {verifyIdToken} from "../../../middleware/auth";

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Verify authentication
        const user = req.user;

        if(!user||!user.roles){
            return res.status(401).json({ error: 'Unauthorized: Unknown User' });
        }

        if(!user.roles.isTranslator&&!user.roles.isAdmin){
            return res.status(401).json({ error: 'Unauthorized: Not a Translator' });
        }

        const { fileData, originalFile } = req.body;

        if (!fileData || !originalFile) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        const bucket = await admin.storage();
        console.log("fileData", fileData)

        // Create the translation file
        const fileName = fileData.slug || `${fileData.title.replace(/\s+/g, '-')}-${fileData.lang}`;
        const file = bucket.file(`upload_from_authors/${fileName}.json`);

        // Upload file to storage
        await file.save(JSON.stringify(fileData), {
            contentType: 'application/json',
            metadata: {
                contentType: 'application/json',
                metadata: {
                    translatedFrom: originalFile.slug,
                    originalLanguage: originalFile.lang,
                    translationLanguage: fileData.lang
                }
            }
        });

        return res.status(200).json({ message: 'Translation created successfully' });
    } catch (error) {
        console.error('Error creating translation:', error);
        return res.status(500).json({ message: `Error creating translation: ${error.message}` });
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