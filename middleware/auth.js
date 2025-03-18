// File: middleware/auth.js

import * as admin from '../firebase/adminConfig';

export const verifyIdToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const auth = await admin.auth();
        const userToken = await auth.verifyIdToken(idToken);
        const user = await auth.getUser(userToken.uid);
        const database = await admin.database();

        const rolesRef = database.ref("roles");
        const rolesSnapshot = await rolesRef.once('value');
        const rolesData = rolesSnapshot.val() || {};


        const userRoles = {}
        if(user.customClaims&& user.customClaims.roles){
            userRoles.isBand = !!user.customClaims.roles.band;
            userRoles.isAuthor = !!user.customClaims.roles.author;
            userRoles.isAdmin = !!user.customClaims.roles.admin;
            userRoles.isCommentAdmin = !!user.customClaims.roles.comments;
            userRoles.isMerchAdmin = !!user.customClaims.roles.merch;
            userRoles.isTranslator = !!user.customClaims.roles.translationSystem;
            userRoles.isLeader = !!user.customClaims.roles.authorLeader;

        }
        req.user = {user, roles: userRoles};
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};