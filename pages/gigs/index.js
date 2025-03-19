import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import UploadGig from '../../components/gigs/UploadGigs';

export default function GigsPage() {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [admin, setIsAdmin] = useState(false);
    const { roles } = useAuth();

    useEffect(() => {
        setIsAdmin(roles.gigs);

        // Fetch gigs data
        const fetchGigs = async () => {
            try {
                const response = await fetch('/api/gigs');
                const data = await response.json();

                console.log("Gigs: ", data.gigs);

                if (data.gigs) {
                    setGigs(data.gigs);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching gigs:", error);
                setLoading(false);
            }
        };

        fetchGigs().then();
    }, [roles]);

    return (
        <>
            {admin && (
                <section className="container flex justify-center">
                    <UploadGig />
                </section>
            )}
            <section className="gigs">
                <div className="container mx-auto px-4">
                    <h1 className="text-center mb-10 text-white text-3xl font-bold">Gigs</h1>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {gigs.map((gig) => (
                                <div key={gig.date} className="group">
                                    <div className="relative h-full bg-white rounded-lg overflow-hidden">
                                        <div className="">
                                            <div className="relative w-full h-64">
                                                <Image
                                                    src={gig.thumbnailURL[0] || '/placeholder.jpg'}
                                                    alt={gig.title}
                                                    width={500}
                                                    height={300}
                                                    objectFit="cover"
                                                    className="border-5 border-white rounded-lg"
                                                />
                                            </div>
                                            <div className="p-4 text-center">
                                                <h5 className="text-lg font-semibold">{gig.title}</h5>
                                            </div>
                                            <div className="p-4 text-center">
                                                <p className="text-gray-700 mb-4">{gig.description}</p>
                                                <Link className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800 transition-colors" href={`/gigs/${gig.date}`}>
                                                    View Gig
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}