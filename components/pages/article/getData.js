export async function getServerSidePropsGeneric(context, early, admin) {
    const { id } = context.params;

    try {
        // Ensure admin SDK is available only on the server
        if (!admin) {
            return { notFound: true }; // Admin SDK shouldn't run on client
        }
        const bucket = await admin.storage();
        const database = await admin.database();

        // Define the path to the article JSON file in Firebase Storage
        //const folder = early?"early_access":'articles';
        const folder = "upload_from_authors"
        const articlePath = `${folder}/${id}.json`;

        // Reference the file from the Firebase Storage bucket
        const file = bucket.file(articlePath);

        // Download the file content as a string
        const [fileContent] = await file.download();

        // Parse the content as JSON
        const article = JSON.parse(fileContent.toString());

        console.log("The article is: ",article)

        const authorCode = article.sub;

        if (article.sub === undefined) {
            article.sub = null;
        }

        article.sub = await getAuthor(authorCode, bucket, database);

        if(article.translatedBy){
            const translatorCode = article.translatedBy;
            article.translatedBy = await getAuthor(translatorCode, bucket, database);
        }

        if (!article) {
            return { notFound: true }; // Trigger 404 if the article doesn't exist
        }

        const metaTags = {
            title: article.title || "Pulse Of The Underground",
            description: article.description || "Stay brutal and explore the unknown metal news, reviews, and features!",
            image: encodeURI(article.img01 || "/path/to/default/image.jpg"),
            type: "article",
            url: `https://pulse-of-the-underground.com/articles/${id}`
        };


        context.req.metaTags = metaTags;
        return {
            props: { article, metatags: metaTags },
        };
    }catch (error) {
        return { props: { error: `Failed to load the article: ${error.message}` } };
    }
}


async function getAuthor(authorCode, bucket, database) {
    if(!authorCode){
        return {authorCode:"undefined", result:false};
    }
    const author = await database.ref(`users/${authorCode}`).once('value');
    if (author.exists()) {
        const authorData = author.val();
        const imageRef = bucket.file(`/profile_images/${authorCode}_600x600`);
        try {
            authorData.photoURL = await imageRef.getDownloadURL();
        } catch (e) {
            authorData.wantToShow = false;
        }
        return {...authorData, code: authorCode, result:true};
    }
    return {authorCode, result:false};
}