import { IncomingForm } from 'formidable';
import { ref as dbRef, update } from 'firebase/database';
import * as admin from '../../firebase/adminConfig';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const database = await admin.database();

    try {
        // Parse form data
        const form = new IncomingForm({
            multiples: true,
            keepExtensions: true,
        });

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        const { date, title, description, thumbnail } = fields;

        if (!date || !title || !description || !thumbnail || !files.files) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Upload files to Firebase Storage
        const storage = await admin.storage();
        const uploadPromises = [];

        // If files.files is an array, process all files
        const filesArray = Array.isArray(files.files) ? files.files : [files.files];

        for (const file of filesArray) {
            const fileContent = fs.readFileSync(file.filepath);
            const filename = path.basename(file.originalFilename);
            const uploadTask = storage.file(`gigs/${date}/${filename}`).save(fileContent)
                .then(() => {
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 1); // Set expiration to 1 day from now

                    return storage.file(`gigs/${date}/${filename}`).getSignedUrl({
                        action: 'read',
                        expires: expirationDate
                    });
                })
                .then((urls) => {
                    return urls[0];
                });

            uploadPromises.push(uploadTask);
        }

        const uploadedFiles = await Promise.all(uploadPromises);

        // Update database
        const gigData = {
            title: title[0],
            details: description[0],
            thumbnail: thumbnail[0],
            files: uploadedFiles,
        };

        await update(dbRef(database, `gigs/${date}`), gigData);

        // Clean up temporary files
        for (const file of filesArray) {
            fs.unlinkSync(file.filepath);
        }

        return res.status(200).json({ message: 'Upload successful' });
    } catch (error) {
        console.error('Error uploading gig:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}