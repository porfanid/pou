/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/assets/:path*",  // Matches any file under /assets/
                destination: "/api/assets?path=:path*", // Redirects to the API
                permanent: false,  // Use false for dynamic URLs
            },
        ];
    },
    images: {
        domains: [
            'pulse-of-the-underground.com',
            'firebasestorage.googleapis.com',
            'heavy-local.com',
            "lh3.googleusercontent.com",
            "i.ytimg.com",
            "via.placeholder.com",
            "storage.googleapis.com",
            "localhost"
        ],
    },

};

export default nextConfig;
