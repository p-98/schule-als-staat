import Document, { Html, Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
    render(): JSX.Element {
        return (
            <Html>
                <Head>
                    <link
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
                        rel="stylesheet"
                    />
                    <link
                        href="https://fonts.googleapis.com/icon?family=Material+Icons"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
