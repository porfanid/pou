import ThemeProvider from "../context/ThemeContext";
import RootLayout from "./layout"; // Import ThemeProvider
import "./globals.css";
import {Noto_Serif} from "next/font/google";
import Head from "next/head";
import NProgress from 'nprogress';
import Router from 'next/router';

const notoSerif = Noto_Serif({
    subsets: ["latin", "greek"],
    weight: ["400", "700"],
    variable: "--font-noto-serif",
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({Component, pageProps}) {
    const getLayout = Component.getLayout ?? ((page) => <RootLayout>{page}</RootLayout>);

    return (
        <ThemeProvider>  {/* Ensure ThemeProvider wraps the entire app */}
            <Head>
                <title>Pulse Of The Underground</title>
                <meta name="description"
                      content={"Stay brutal and explore the unknown metal news, reviews, and features!"}/>
                <meta property="og:title" content={"About Us Pulse Of The Underground"}/>
                <meta property="og:description"
                      content={"Stay brutal and explore the unknown metal news, reviews, and features!"}/>
                <meta property="og:image" content={"/assets/PulseOfTheUnderground.jpg"}/>


                <link rel="apple-touch-icon" sizes="180x180" href="/favicon.io/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.io/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon.io/favicon-16x16.png"/>
                <link rel="icon" href="/favicon.ico"/>
                <link rel="manifest" href="/favicon.io/site.webmanifest"/>
            </Head>
            <div className={`${notoSerif.variable}`}>
                {getLayout(<Component {...pageProps} />)}
            </div>
        </ThemeProvider>
    );
}
