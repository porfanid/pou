import Footer from "../components/footer";
import AppNavigation from "../components/navigation/navigation";
import {AuthProvider} from "../context/AuthContext";
import DonationWidget from "../components/donation/DonationWidget";
import StripeProvider from "../providers/StripeProvider";

export default function RootLayout({children}) {


    return (
        <AuthProvider>
            <StripeProvider>
            <div className="min-h-screen flex flex-col bg-background dark:bg-background">
                <AppNavigation/>
                <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-black to-[#200000]">
                    {children}
                </main>
                <Footer/>
                <DonationWidget />
            </div>
            </StripeProvider>
        </AuthProvider>
    );
}