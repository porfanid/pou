import Head from 'next/head';

export default function PrivacyPolicy() {
    return (
        <>
            <Head>
                <title>Privacy Policy | Pulse of the Underground</title>
            </Head>
            <div className="min-h-screen text-gray-300 flex justify-center p-6">
                <div className="max-w-3xl w-full bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
                    <h1 className="text-3xl font-bold text-red-600 text-center uppercase border-b border-red-600 pb-4">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-gray-400">
                        Welcome to <span className="text-red-500 font-semibold old-english-font">Pulse of the Underground</span>!
                    </p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">1. Information We Collect</h2>
                    <p className="mt-2">We only collect the following minimal information:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
                        <li>Your email address for authentication via Firebase.</li>
                        <li>(Optional) Your profile name, which you may leave blank.</li>
                    </ul>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">2. How We Use Your Information</h2>
                    <p className="mt-2">We use your email for authentication only. Your profile name is used only for display within your account. We do not share your data with anyone.</p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">3. Data Storage & Third Parties</h2>
                    <p className="mt-2">
                        We store data on <span className="text-red-400">Firebase</span>, a Google service, meaning Google may have access to it. Please refer to{' '}
                        <a href="https://firebase.google.com/support/privacy" className="text-blue-400 underline">Google&#39;s Privacy Policy</a> for details.
                    </p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">4. Cookies & Tracking</h2>
                    <p className="mt-2">
                        We do not store cookies. However, we use <span className="text-red-400">Google Analytics</span> to improve user experience. No personal data is shared.
                    </p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">5. Notifications</h2>
                    <p className="mt-2">Users can opt-in for browser notifications, which they can disable anytime via browser settings.</p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">6. GDPR Compliance</h2>
                    <p className="mt-2">You have the right to access, modify, or delete your data. Contact us for any privacy-related requests.</p>
                    <h2 className="mt-6 text-xl text-red-500 font-semibold">7. Children&#39;s Privacy</h2>
                    <p className="mt-2">Since our site is child-friendly, we ensure minimal data collection and strong security measures.</p>
                    <p className="mt-6 text-gray-500 italic">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </>
    );
}
