import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AuthorCard = ({ name, bio, photoURL, role }) => (
    <div className="bg-[#100000] p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-gray-800">
        {photoURL && (
            <img src={photoURL} alt={name} className="w-240 h-240 object-cover rounded-full mx-auto mb-4 border-[7px] border-[#600000] shadow-md" />
        )}
        <h2 className="text-text-bold text-2xl font-semibold text-center ">{name}</h2>
        {role && <p className="text-sm text-gray-400 text-center mb-2">{role}</p>}
        <p className="text-gray-400 text-sm text-center">{bio}</p>
    </div>
);

export default function AboutUs({ authors }) {
    return (
        <div className="min-h-screen text-white py-16 px-6 md:px-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 text-text-bold old-english-font">About Us</h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                    Welcome to <strong className={"old-english-font"}>Pulse Of The Underground</strong>, a magazine dedicated to supporting underground music.
                    Our mission is to amplify the voices of independent musicians, bands, and producers shaping the sounds of tomorrow.
                </p>
            </div>
            <hr style={{
                borderColor: "#600000",
            }} className={"mt-5 mb-5 bg-text-bold text-text-bold"}/>
            <div className="max-w-4xl mx-auto text-center mb-8">
                <h2 className="text-3xl font-bold text-text-bold">Meet Our Authors</h2>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {authors.length === 0
                    ? Array(6)
                        .fill()
                        .map((_, index) => (
                            <div key={index} className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                                <Skeleton circle height={80} width={80} className="mx-auto mb-4" />
                                <Skeleton height={20} width="60%" className="mx-auto mb-2" />
                                <Skeleton count={2} className="mx-auto" />
                            </div>
                        ))
                    : Object.entries(authors).map(([key, author]) =>
                        author.displayName ? (
                            <AuthorCard key={key} name={author.displayName} photoURL={author.photoURL} bio={author.bio} role={author.role} />
                        ) : null
                    )}
            </div>

            <div className="max-w-3xl mx-auto text-center mt-12 text-gray-300">
                <p className="leading-relaxed">
                    Whether you&#39;re an artist looking for exposure or a listener searching for your next favorite track, we invite
                    you to join us. Let’s keep the underground alive—because great music deserves to be heard.
                </p>
            </div>
        </div>
    );
}

const listAllUsers = async (nextPageToken, auth) => {
    // List batch of users, 1000 at a time.
    let result;
    if(!nextPageToken){
        result = await auth.listUsers(1000);
    }else{
        result = await auth.listUsers(1000, nextPageToken);
    }
    const adminUsers = result.users.filter(user => user.customClaims && user.customClaims.roles && user.customClaims.roles.author);

    if (result.pageToken) {
        // List next batch of users.
        const nextBatch = await listAllUsers(result.pageToken);
        return adminUsers.concat(nextBatch);
    }
    return adminUsers;
};

export async function getServerSideProps() {
    const admin = require('../firebase/adminConfig');
    const auth = await admin.auth();

    const adminUsers = (await listAllUsers(null,auth)).map(user=>user.uid);

    try {
        const database = await  admin.database();
        const authorsRef = database.ref('users');
        const snapshot = await authorsRef.once('value');
        const authors = snapshot.val() || {};  // Ensure author is an object to prevent errors
        const filteredAuthors = Object.fromEntries(
            Object.entries(authors).filter(([key, author]) => adminUsers.includes(key))
        );
        return { props: { authors: filteredAuthors } };
    } catch (error) {
        console.error('Error fetching author:', error);
        return { props: { authors: {} } }; // Return an empty object instead of an empty array
    }
}
