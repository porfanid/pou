const admin = require("../../firebase/adminConfig");

import express from "express";
import multer from "multer";
import { sendNotification } from "./notificationService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/upload-article", upload.single("image"), async (req, res) => {
    try {
        const { title, details, articleContent, category, language, socials, uid } = req.body;
        const storage = await admin.storage();
        const database = await admin.database();
        if (!uid) return res.status(401).json({ error: "Unauthorized" });

        // Verify user
        const user = await auth.getUser(uid);
        if(!user.claims.admin) return res.status(403).json({ error: "Unauthorized" });
        if (!user) return res.status(403).json({ error: "Invalid user" });

        const timestamp = Date.now();
        const sanitizedTitle = title.replace(/[^\p{L}\p{N} ]/gu, "-").replace(/-+/g, "-");
        const fileName = `${sanitizedTitle}.json`;

        // Upload image to Firebase Storage (if provided)
        let imageUrl = null;
        if (req.file) {
            const fileRef = storage.file(`images/${sanitizedTitle}`);
            await fileRef.save(req.file.buffer, { contentType: req.file.mimetype });
            imageUrl = `https://pulse-of-the-underground.com/assets/${sanitizedTitle}`;
        }

        // Prepare article content JSON
        const articleData = {
            title,
            details,
            content: articleContent.replace(/<[^>]*style="[^"]*color:\s*[^";]*;?[^"]*"[^>]*>/g, ''),
            category,
            socials,
            language,
            authorId: uid,
            authorName: user.displayName,
            img01: imageUrl,
            createdAt: new Date().toISOString(),
        };

        // Upload article JSON to Firebase Storage
        const fileRef = storage.file(`articles/${fileName}`);
        await fileRef.save(JSON.stringify(articleData), {
            contentType: "application/json",
        });

        // Notify admins/leaders
        const rolesRef = database.ref("roles");
        const rolesSnapshot = await rolesRef.get();
        if (rolesSnapshot.exists) {
            const { admin, authorLeader } = rolesSnapshot.val();
            [...(admin || []), ...(authorLeader || [])].forEach(sendNotification);
        }

        res.json({ success: true, message: "Article uploaded successfully!" });
    } catch (error) {
        console.error("Error uploading article:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
