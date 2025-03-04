import {useEffect, useRef, useState} from "react";
import Footer from "../components/footer";
import AppNavigation from "../components/navigation/navigation";
import {useAuth} from "../context/AuthContext";
import DonationWidget from "../components/donation/DonationWidget";

export default function RootLayout({children}) {
    const [menuVisible, setMenuVisible] = useState(true);
    const [isScrollable, setIsScrollable] = useState(true);
    const placeholderRef = useRef(null);

    const {user, roles, notifications} = useAuth();

    useEffect(() => {
        const checkScrollable = () => {
            const isScrollable = window.innerHeight < document.body.scrollHeight;
            setIsScrollable(isScrollable);
        };

        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        window.addEventListener('scroll', checkScrollable);

        return () => {
            window.removeEventListener('resize', checkScrollable);
            window.removeEventListener('scroll', checkScrollable);
        };
    }, []);

    useEffect(() => {
        if (isScrollable) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    setMenuVisible(entry.isIntersecting);
                },
                {threshold: 0.1} // Adjusted threshold for better visibility control
            );

            const currentPlaceholder = placeholderRef.current;

            if (currentPlaceholder) {
                observer.observe(currentPlaceholder);
            }

            return () => {
                if (currentPlaceholder) {
                    observer.unobserve(currentPlaceholder);
                }
            };
        } else {
            setMenuVisible(true);
        }
    }, [isScrollable]);


    return (
            <div className="min-h-screen flex flex-col bg-background dark:bg-background">
                <div ref={placeholderRef} style={{height: '1px'}}></div>
                <AppNavigation menuVisible={menuVisible} user={user} roles={roles} notifications={notifications}/>
                <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-black to-[#200000]">
                    {children}
                </main>
                <Footer/>
                <DonationWidget />
            </div>
    );
}