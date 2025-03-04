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
                        <li>If you make purchases, we may collect your shipping address and phone number.</li>
                    </ul>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">2. How We Use Your Information</h2>
                    <p className="mt-2">
                        We use your email for authentication only. Your profile name is used only for display within your account.
                        Shipping details are used solely for order fulfillment. We do not share your data with third parties.
                    </p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">3. Data Storage & Retention Policy</h2>
                    <p className="mt-2">
                        We store data on <span className="text-red-400">Firebase</span>, which follows compliance regulations for the <span className="text-red-400">us-central1</span> region.
                    </p>
                    <p className="mt-2">
                        <strong>We store user profile data until the user deletes their account or for a maximum of 2 years of inactivity.</strong>
                        After 2 years of inactivity, all user data will be permanently deleted.
                    </p>
                    <p className="mt-2">
                        For purchases, we store <strong>shipping details for a minimum of 2 years</strong> after order fulfillment to handle refunds and disputes and newer orders so that you don't have to enter your details again(unless you choose to delete your data).
                    </p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">4. GDPR & Legal Compliance</h2>
                    <p className="mt-2">
                        We comply with the **General Data Protection Regulation (GDPR)**, UK GDPR, and Swiss FDPA.
                    </p>
                    <p className="mt-2">
                        - We have **certified** the <a href="https://cloud.google.com/terms/data-processing-addendum?hl=en" className="text-red-400 underline" target="_blank" rel="noopener noreferrer">
                        Google Cloud Data Processing Addendum</a>, reviewed and accepted on <strong>March 3, 2025</strong>.
                    </p>
                    <p className="mt-2">
                        - We have **certified** that our use of Google Cloud Platform is subject to the **EU GDPR, UK GDPR, and Swiss FDPA**.
                        <br /><strong>Certified on March 3, 2025 by pavlos@orfanidis.net.gr</strong>.
                    </p>
                    <p className="mt-2">
                        - We have adopted the **Standard Contractual Clauses (SCCs)** for transferring data outside of the EU.
                    </p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">5. U.S. & International Compliance</h2>
                    <p className="mt-2">
                        Our platform complies with various U.S. and international privacy laws:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400">
                        <li>
                            **COPPA (Children’s Online Privacy Protection Act)** – Our service is **not** designed for children under **13 years old**.
                        </li>
                        <li>
                            **CCPA (California Consumer Privacy Act)** – California residents can request access to or deletion of their data.
                        </li>
                        <li>
                            **SOC 2 & ISO 27001** – Firebase and Google Cloud are certified under **SOC 2, ISO 27001**, ensuring strong security practices.
                        </li>
                    </ul>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">6. Cookies & Tracking</h2>
                    <p className="mt-2">
                        We do not store cookies. However, we use <span className="text-red-400">Google Analytics</span> to improve user experience. No personal data is shared.
                    </p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">7. Notifications</h2>
                    <p className="mt-2">Users can opt-in for browser notifications, which they can disable anytime via browser settings.</p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">8. Data Deletion Requests</h2>
                    <p className="mt-2">
                        Users have the right to delete their data at any time. You can request data deletion via your account settings or by contacting us.
                    </p>

                    <h2 className="mt-6 text-xl text-red-500 font-semibold">9. Changes to This Policy</h2>
                    <p className="mt-2">
                        We may update this Privacy Policy periodically. Any changes will be reflected on this page.
                    </p>

                    <p className="mt-6 text-gray-500 italic">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </>
    );
}
