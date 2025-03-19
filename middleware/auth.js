// File: middleware/auth.js

import * as admin from '../firebase/adminConfig';

export const verifyIdToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        req.authError = 'Unauthorized';
        return next();
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
        req.authError = 'Unauthorized';
        return next();
    }

    try {
        const auth = await admin.auth();
        const userToken = await auth.verifyIdToken(idToken);
        const user = await auth.getUser(userToken.uid);
        const database = await admin.database();

        const rolesRef = database.ref("roles");
        const rolesSnapshot = await rolesRef.once('value');

        const userRoles = {};
        if (user.customClaims && user.customClaims.roles) {
            userRoles.isBand = !!user.customClaims.roles.band;
            userRoles.isAuthor = !!user.customClaims.roles.author;
            userRoles.isAdmin = !!user.customClaims.roles.admin;
            userRoles.isCommentAdmin = !!user.customClaims.roles.comments;
            userRoles.isMerchAdmin = !!user.customClaims.roles.merch;
            userRoles.isTranslator = !!user.customClaims.roles.translationSystem;
            userRoles.isLeader = !!user.customClaims.roles.authorLeader;
            userRoles.isGigAdmin = !!user.customClaims.roles.gigs;
            userRoles.isGalleryAdmin = !!user.customClaims.roles.galleryAdmin;
        }
        req.user = { user, roles: userRoles };
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        req.authError = 'Unauthorized';
        next();
    }
};