import Footer from "./footer";


export default function RootLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-background">
            <main className="flex-grow flex items-center justify-center">{children}</main>
            <Footer />
        </div>
    );
}
