const admin = require("../../firebase/adminConfig");

import { getStorage } from 'firebase-admin/storage';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';
import {IncomingForm} from 'formidable';
import fs from 'fs';

// Disable the default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Initialize Firebase Admin (only if not already initialized)

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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

            // Prepare article data
            const articleData = {
                title,
                details,
                content: articleContent.replace(/<[^>]*style="[^"]*color:\s*[^";]*;?[^"]*"[^>]*>/g, ''),
                category,
                socials,
                language,
                sub: uid,
                img01: imageUrl,
                slug: sanitizedSlug
            };

            // Upload article JSON to Firebase Storage
            const jsonFileRef = storage.file(`upload_from_authors/${sanitizedSlug}.json`);
            await jsonFileRef.save(JSON.stringify(articleData), {
                contentType: "application/json",
            });

            // Notify admins/leaders (you'll need to implement this part)
            const rolesRef = database.ref("roles");
            const rolesSnapshot = await rolesRef.get();
            if (rolesSnapshot.exists()) {
                const { admin, authorLeader } = rolesSnapshot.val();
                // Implement notification logic here
            }

            res.status(200).json({
                success: true,
                message: "Article uploaded successfully!",
                articleUrl: imageUrl
            });

        } catch (error) {
            console.error("Error uploading article:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    }).then();
}