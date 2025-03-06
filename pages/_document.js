import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {

    static async getInitialProps(ctx) {



        const initialProps = await Document.getInitialProps(ctx);

        return { ...initialProps, metaTags: ctx?.req?.metaTags || {
            title: "Pulse Of The Underground",
            description: "Stay brutal and explore the unknown metal news, reviews, and features!",
            image: "/path/to/default/image.jpg",
            url: "https://pulse-of-the-underground.com/",
            } };
    }

    render() {
        const { metaTags } = this.props;

        return (
            <Html lang="en">
                <Head>
                    <title>{metaTags.title}</title>
                    <meta name="description" content={metaTags.description} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={metaTags.title} />
                    <meta property="og:description" content={metaTags.description} />
                    <meta property="og:image" content={metaTags.image} />
                    <meta property="og:url" content={metaTags.url} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
