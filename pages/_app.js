import ThemeProvider from "../components/ThemeContext";
import RootLayout from "../components/layout";  // Import ThemeProvider
import "./globals.css";
import { Noto_Serif } from "next/font/google";

const notoSerif = Noto_Serif({
    subsets: ["latin", "greek"],
    weight: ["400", "700"],
    variable: "--font-noto-serif",
});

export default function MyApp({ Component, pageProps }) {
    const getLayout = Component.getLayout ?? ((page) => <RootLayout>{page}</RootLayout>);

    return (
        <ThemeProvider>  {/* Ensure ThemeProvider wraps the entire app */}
            <div className={`${notoSerif.variable}`}>
            {getLayout(<Component {...pageProps} />)}
            </div>
        </ThemeProvider>
    );
}
