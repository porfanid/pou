import ThemeProvider from "../context/ThemeContext";
import RootLayout from "./layout"; // Import ThemeProvider
import "./globals.css";
import { Noto_Serif } from "next/font/google";
import NProgress from "nprogress";
import Router from "next/router";

const notoSerif = Noto_Serif({
    subsets: ["latin", "greek"],
    weight: ["400", "700"],
    variable: "--font-noto-serif",
});

// Setup NProgress for route changes
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
    const getLayout = Component.getLayout ?? ((page) => <RootLayout>{page}</RootLayout>);
    return (
        <ThemeProvider> {/* Ensure ThemeProvider wraps the entire app */}
            <div className={`${notoSerif.variable}`}>
                {/* Example of using metaTags (optional) */}

                {getLayout(<Component {...pageProps} />)}
            </div>
        </ThemeProvider>
    );
}

export default MyApp;
