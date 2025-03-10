const admin = require("../../../firebase/adminConfig");
import { verifyIdToken } from '../../../middleware/auth';
import {withMiddleware} from '../../../utils/withMiddleware';


import {IncomingForm} from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};


async function handler(req, res) {


    // Initialize Firebase Admin (only if not already initialized)
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = req.user;

    if(!user||!user.roles){
        return res.status(401).json({ error: 'Unauthorized: Unknown User' });
    }

    if(!user.roles.isAuthor&&!user.roles.isAdmin){
        return res.status(401).json({ error: 'Unauthorized: Not an Author' });
    }

    // Parse form data with files
    const form = new IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing form data' });
        }

        try {
            // Convert fields to proper types
            const [title] = fields.title;
            const [details] = fields.details;
            const [articleContent] = fields.content ;
            const [category] = fields.category;
            const [language] = fields.lang;
            const socials = JSON.parse(fields.socials[0]);
            const [uid] = fields.sub;
            const [slug] = fields.slug;

            const storage = await admin.storage();
            const database = await admin.database();
            const auth = await admin.auth();

            console.log(fields);

            // Verify user
            const user = await auth.getUser(uid);
            if (!user) return res.status(403).json({ error: "Invalid user" });

            // Sanitize slug
            const sanitizedSlug = slug

            // Handle image upload
            let imageUrl = null;
            const [imageFile] = files.image;
            if (imageFile) {
                console.log(imageFile.filepath);
                const fileBuffer = fs.readFileSync(imageFile.filepath);
                const fileRef = storage.file(`images/${sanitizedSlug}`);

                await fileRef.save(fileBuffer, {
                    contentType: imageFile.mimetype || 'image/jpeg',
                    metadata: {
                        contentType: imageFile.mimetype || 'image/jpeg'
                    }
                });
                imageUrl = `https://pulse-of-the-underground.com/assets/${sanitizedSlug}`;
            }

            // Prepare articles data
            const articleData = {
                title,
                details,
                content: articleContent,
                category,
                socials,
                language,
                sub: uid,
                slug: sanitizedSlug,
                date: new Date().toLocaleDateString('en-GB', options),
                authorApproved: true,
                isReady: true,
            };


            const articleMetadata = {
                title,
                details,
                category,
                socials,
                language,
                sub: uid,
                img01: imageUrl,
                slug: sanitizedSlug,
                date: new Date().toLocaleDateString('en-GB', options),
            };

            // Upload articles JSON to Firebase Storage
            const jsonFileRef = storage.file(`upload_from_authors/${sanitizedSlug}.json`);
            await jsonFileRef.save(JSON.stringify(articleData), {
                contentType: "application/json",
            });

            // Save articles data to Firebase Realtime Database
            const articlesRef = database.ref(`articlesList/upload_from_authors/${category}/${sanitizedSlug}`);
            await articlesRef.set(articleMetadata);




            // Notify admins/leaders (you'll need to implement this part)
            const rolesRef = database.ref("roles");
            const rolesSnapshot = await rolesRef.get();
            if (rolesSnapshot.exists()) {
                //const { admin, authorLeader } = rolesSnapshot.val();
                // Implement notification logic here
            }

            res.status(200).json({
                success: true,
                message: "Article uploaded successfully!",
                articleUrl: imageUrl
            });

        } catch (error) {
            console.error("Error uploading articles:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    }).then();
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