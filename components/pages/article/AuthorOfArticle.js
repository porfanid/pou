import Link from "next/link";
import Image from "next/image";

const AuthorOfArticle = ({ author, className = {} }) => {
    if (!author) return <div>Loading...</div>;

    return (
        <div className={className}>
            <div className="flex items-center space-x-4">
                {author.photoURL && (
                    <div className="relative rounded-full overflow-hidden w-10 h-10">
                        <Image
                            width={"100"}
                            height={"100"}
                            src={author.photoURL}
                            alt={`${author.displayName}'s profile picture`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    </div>
                )}
                <Link href={`/author/${author.code}`} className="text-center">
                    <div>
                        <span className="block text-info text-lg font-semibold text-blue-400">{author.displayName}</span>
                    </div>
                    <div>
                        <span className="block text-white text-sm">{author.role}</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AuthorOfArticle;
