import React from "react";

export default function TermsOfService() {
    return (
        <div className="min-h-screen text-gray-200 py-10 px-6 md:px-20">
            <div className="max-w-4xl mx-auto border border-gray-700 p-8 rounded-lg shadow-lg bg-gray-900">
                <h1 className="text-4xl font-bold text-red-600 mb-6">Terms of Service</h1>

                <p className="mb-4">
                    Welcome to <span className="text-red-500">Pulse of the Underground</span>. By using our website, you agree to the following terms and conditions.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">1. Account Creation & Deletion</h2>
                <p className="mb-4">
                    Users can create and delete their accounts at any time. Account management is handled via Firebase Authentication, and all restrictions imposed by Firebase apply.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">2. User-Generated Content</h2>
                <p className="mb-4">
                    Users may post comments, which are publicly visible along with their full name. If a comment is reported and deemed inappropriate, it may be removed by our moderation team.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">3. Community Guidelines</h2>
                <p className="mb-4">
                    Users must follow our community guidelines, which may be updated periodically. Failure to comply may result in content removal or account restrictions.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">4. Limitation of Liability</h2>
                <p className="mb-4">
                    Pulse of the Underground is not responsible for:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Any harm caused by incorrect or misinterpreted information on the site.</li>
                    <li>Any damages resulting from interactions between users.</li>
                    <li>Loss of access due to downtime or security breaches beyond our control.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">5. Site Availability</h2>
                <p className="mb-4">
                    We reserve the right to shut down the website at any time for any reason.
                </p>

                <h2 className="text-2xl font-semibold text-red-500 mt-6">6. Governing Law</h2>
                <p className="mb-4">
                    Any disputes arising from the use of this website will be governed by Greek law.
                </p>

                <p className="text-gray-400 text-sm mt-6">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
