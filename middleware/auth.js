// File: middleware/auth.js

import * as admin from '../firebase/adminConfig';

export const verifyIdToken = async (req, res, next) => {
    console.log("Test headers")
    console.log(req.headers);
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
        if(user.claims){
            userRoles.isBand = !!user.claims.band;
            userRoles.isAuthor = !!user.claims.admin;
        }
        if(!!rolesData) {
            userRoles.isTranslator = rolesData.translationSystem.includes(user.email);
            userRoles.isLeader = rolesData.authorLeader.includes(user.email);
            userRoles.isAdmin = rolesData.admin.includes(user.email);
            userRoles.isCommentAdmin = (rolesData.comments || []).includes(user.email);
            userRoles.isMerchAdmin = (rolesData.merch || []).includes(user.email);
        }

        req.user = {user, roles: userRoles};
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};