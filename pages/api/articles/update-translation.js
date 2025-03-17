// This file would be placed in /pages/api/articles/update-translation.js
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

        const { file, translations, folder } = req.body;

        if (!file || !translations) {
            return res.status(400).json({ message: 'Missing required data' });
        }



        console.log("translations: ",translations)
        console.log("file", file);
        console.log("folder", folder)
        return res.status(400).json({ message: 'Missing required data' });

        const bucket = await admin.storage();

        // Get the current file content
        const fileName = `${file.slug}.json`;
        const storageFile = bucket.file(`${folder}/${fileName}`);

        const [fileContent] = await storageFile.download();
        const contentJson = JSON.parse(fileContent.toString());

        // Update translations
        contentJson.translations = translations;

        // Upload the updated file
        await storageFile.save(JSON.stringify(contentJson), {
            contentType: 'application/json',
            metadata: {
                contentType: 'application/json'
            }
        });

        // Update all related translations to include the new translation
        await updateRelatedTranslations(translations, file.slug, bucket);

        return res.status(200).json({ message: 'Translations updated successfully' });
    } catch (error) {
        console.error('Error updating translations:', error);
        return res.status(500).json({ message: `Error updating translations: ${error.message}` });
    }
}

async function updateRelatedTranslations(translations, excludeSlug, bucket) {
    // Get all translations and update their translation references
    for (const [lang, slug] of Object.entries(translations)) {
        if (slug === excludeSlug) continue;

        // Check if file exists in upload_from_authors
        const fileName = `${slug}.json`;
        let file;
        let folder;

        try {
            // Try in upload_from_authors first
            file = bucket.file(`upload_from_authors/${fileName}`);
            const [exists] = await file.exists();

            if (exists) {
                folder = 'upload_from_authors';
            } else {
                // Try in articles
                file = bucket.file(`articles/${fileName}`);
                const [articleExists] = await file.exists();

                if (articleExists) {
                    folder = 'articles';
                } else {
                    // Try in early_releases
                    file = bucket.file(`early_releases/${fileName}`);
                    const [earlyExists] = await file.exists();

                    if (earlyExists) {
                        folder = 'early_releases';
                    } else {
                        // File doesn't exist in any folder, skip it
                        continue;
                    }
                }
            }

            // Update the file with new translations reference
            const [fileContent] = await file.download();
            const contentJson = JSON.parse(fileContent.toString());

            contentJson.translations = translations;

            await file.save(JSON.stringify(contentJson), {
                contentType: 'application/json',
                metadata: {
                    contentType: 'application/json'
                }
            });
        } catch (error) {
            console.error(`Error updating related translation ${slug}:`, error);
            // Continue with other translations even if one fails
        }
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