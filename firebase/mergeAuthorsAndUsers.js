import {database} from './adminConfig.js';

const db = await database();

async function mergeAuthorsAndUsers() {
    try {

        const authorsRef = db.ref('authors');
        const usersRef = db.ref('users');

        // Fetch authors and users data
        const [authorsSnapshot, usersSnapshot] = await Promise.all([
            authorsRef.once('value'),
            usersRef.once('value')
        ]);

        const authors = authorsSnapshot.val() || {};
        const users = usersSnapshot.val() || {};

        // Merge authors into users
        const mergedUsers = { ...users, ...authors };

        // Write merged data back to /users
        await usersRef.set(mergedUsers);

        console.log('Successfully merged authors and users into /users');
    } catch (error) {
        console.error('Error merging authors and users:', error);
    }
}

await mergeAuthorsAndUsers();