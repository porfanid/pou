import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import UploadGig from '../../components/gigs/UploadGigs';

export default function GigsPage() {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [admin, setIsAdmin] = useState(false);
    const { user, roles } = useAuth();

    useEffect(() => {
        setIsAdmin(roles && roles.gigs);

        const fetchGigs = async () => {
            try {
                const response = await fetch('/api/events');
                const data = await response.json();

                console.log("Gigs: ", data.gigs);

                if (data.gigs) {
                    setGigs(data.gigs);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };

        fetchGigs();
    }, [roles]);

    const handleDelete = async (date) => {
        if (confirm('Are you sure you want to delete this gig?')) {
            if(!user){
                console.error('Unauthorized: Unknown User');
                return;
            }
            try {
                const response = await fetch(`/api/events/${date}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.idToken}`, // Replace `user.token` with the actual token
                    },
                });

                if (response.ok) {
                    setGigs(gigs.filter(gig => gig.date !== date));
                } else {
                    console.error('Failed to delete gig');
                }
            } catch (error) {
                console.error('Error deleting gig:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-12 px-4">
            {admin && (
                <section className="container mx-auto mb-12 flex justify-center">
                    <UploadGig />
                </section>
            )}
            <section className="gigs">
                <div className="container mx-auto px-4">
                    <h1 className="text-center mb-10 text-red-600 text-4xl md:text-5xl font-black uppercase tracking-widest drop-shadow-lg">
                        Past Events
                    </h1>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 border-opacity-50"></div>
                        </div>
                    ) : gigs.length === 0 ? (
                        <div className="text-center text-gray-400 text-lg">No gigs found. Stay tuned!</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gigs.map((gig) => (
                                <div
                                    key={gig.date}
                                    className="relative group bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-red-600/50 transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    <div className="relative w-full h-64 overflow-hidden">
                                        <Image
                                            src={gig.thumbnailURL[0] || '/placeholder.jpg'}
                                            alt={gig.title}
                                            width={500}
                                            height={300}
                                            className="object-cover w-full h-full group-hover:opacity-90 transition duration-300"
                                        />
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-50"></div>
                                    </div>

                                    <div className="p-6 text-center">
                                        <h5 className="text-xl font-bold text-white uppercase tracking-wide mb-2">
                                            {gig.title}
                                        </h5>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{gig.description}</p>

                                        <Link
                                            href={`/events/${gig.date}`}
                                            className="inline-block px-6 py-2 border-2 border-red-600 text-red-600 font-semibold uppercase text-xs tracking-widest rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                                        >
                                            View Gig
                                        </Link>

                                        {admin && (
                                            <button
                                                onClick={() => handleDelete(gig.date)}
                                                className="inline-block px-6 py-2 mt-2 border-2 border-red-600 text-red-600 font-semibold uppercase text-xs tracking-widest rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}