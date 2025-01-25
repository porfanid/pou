import RootLayout from '../components/layout.js'
export default function MyApp({ Component, pageProps }) {
    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout ?? RootLayout

    return getLayout(<Component {...pageProps} />)
}