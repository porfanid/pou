import React from "react";
import { AccordionComponent } from "../../components/AccordionComponent";
import Image from "next/image";

export async function getServerSideProps({ params }) {
    const { authorCode } = params;
    const admin = require("../../firebase/adminConfig");
    const database = await admin.database();

    let authorRef = database.ref(`users/${authorCode}`);
    let snapshot = await authorRef.once("value");
    let authorData = null;
    if(snapshot.exists()) {
        authorData = snapshot.val();
    }else{
        authorRef = database.ref(`users/${authorCode}`);
        snapshot = await authorRef.once("value");
        if(snapshot.exists()) {
            authorData = snapshot.val();
        }
    }

    if (!authorData) {
        authorRef = database.ref(`users/${authorCode}`);
        snapshot = await authorRef.once("value");
        authorData = snapshot.exists() ? snapshot.val() : null;
    }

    return { props: { author: authorData } };
}

const AuthorPage = ({ author }) => {
    return (
        <div className="container mx-auto mt-10 px-4 bg-black text-gray-300 py-10 rounded-lg">
            {/* Author Header */}
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-900 to-gray-600 drop-shadow-lg">
                    {author.displayName}
                </h1>

                {/* Profile Image with Neon Glow */}
                <div className="relative mt-6">
                    <Image
                        width={500}
                        height={500}
                        src={author.photoURL}
                        alt={author.displayName}
                        className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-full border-4 border-red-800 shadow-lg shadow-red-900 transition-transform transform hover:scale-110"
                    />
                    <div className="absolute inset-0 w-full h-full bg-red-700 blur-xl opacity-30 rounded-full"></div>
                </div>
            </div>

            {/* Author Bio */}
            <div className="mt-6 bg-gray-900 text-white p-6 rounded-xl shadow-md text-center border border-red-800 shadow-red-900">
                <p className="text-lg tracking-wide italic">{author.bio}</p>
            </div>

            {/* Articles Section */}
            <div className="mt-10">
                <h2 className="text-3xl font-bold text-red-500 text-center mb-5 uppercase tracking-widest">
                    ⚡ Articles by {author.displayName}
                </h2>
                <AccordionComponent articles={(author.writtenArticles)?author.writtenArticles.articles:{}} />
            </div>
        </div>
    );
};

export default AuthorPage;
