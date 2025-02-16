import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#200000] via-[#100000] to-[#200000] text-white py-8">
            <div className="max-w-screen-xl mx-auto px-6 flex flex-col items-center space-y-4">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                    <Link href="/aboutUs" className="text-lg font-semibold hover:text-gray-200 transition-colors">
                        About Us
                    </Link>
                    <Link href="/privacy" className="text-lg font-semibold hover:text-gray-200 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-lg font-semibold hover:text-gray-200 transition-colors">
                        Terms of Service
                    </Link>
                    <a href="#" className="text-lg font-semibold hover:text-gray-200 transition-colors">
                        Contact
                    </a>
                </div>
                <div className="border-t border-gray-400 w-full pt-4">
                    <p className="text-sm text-center">
                        &copy; {new Date().getFullYear()} Pulse Of the Underground. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}