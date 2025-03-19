import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import PrimaryCarousel from '../../components/pages/index/carousel/carousel';

export default function GigDetailPage() {
    const router = useRouter();
    const {date} = router.query;
    const [gig, setGig] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!date) return;

        const fetchGigDetails = async () => {
            try {
                const response = await fetch(`/api/gigs/${date}`);
                const data = await response.json();
                if (data.gig) {
                    setGig(data.gig);
                    setPhotos(data.photos || []);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching gig details:", error);
                setLoading(false);
            }
        };

        fetchGigDetails().then();
    }, [date]);

    if (loading || !gig) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-10">
            <h1 className="text-center mb-10 text-white text-3xl font-bold">{gig.title}</h1>
            <p className="text-center mb-10 text-white">{gig.description}</p>
            <PrimaryCarousel
                images={photos}
                fullImages={photos}
                imageBorderClass="m-3 border-5 border-white rounded-lg"
                shouldBeFull={false}
            />
            <div className="flex justify-center mt-6 mb-6">
                <Link className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      href="/gigs">
                    Back to All Gigs
                </Link>
            </div>
        </div>
    );
}