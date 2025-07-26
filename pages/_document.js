import Document,{Html,Head,Main,NextScript} from "next/document";
import {ServerStyleSheet} from "styled-components";
import {BASE_URL} from "@constants/Common";
export default class CustomDocument extends Document
{
    static async getInitialProps(context) {
        const initialProps = await Document.getInitialProps(context);
        const sheet = new ServerStyleSheet();
        const page = context.renderPage((App) => (props) => sheet.collectStyles(<App {...props} />));
        const styleTags = sheet.getStyleElement();
        return {...initialProps,...page,styleTags,host: context.req ? context.req.hostname ? context.req.hostname : "" : ""};
    }
    render(){
        return (
            <Html lang="en">
                <Head>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-82CST3DPL0"/>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', 'G-82CST3DPL0');
                            `,
                        }}
                    />
                    <link rel="dns-prefetch" href="//fonts.googleapis.com"/>
                    <link rel="dns-prefetch" href="//www.google.com"/>
                    <link rel="dns-prefetch" href="//schema.org"/>
                    <link rel="dns-prefetch" href={BASE_URL}/>
                    <link rel="stylesheet" href={`${BASE_URL}/assets/css/style.css`}/>
                    <link rel="shortcut icon" href={`${BASE_URL}/assets/images/favicon.png`}/>
                    <link href="https://fonts.googleapis.com/css2?family=Krona+One&display=swap" rel="stylesheet"/>
                    <meta name="viewport" content="minimum-scale=1,initial-scale=1,width=device-width,shrink-to-fit=no,user-scalable=no,viewport-fit=cover"/>
                    <meta name="msvalidate.01" content="263D9D5D83E0685E78FE37BAEA01D04C"/>
                </Head>
                <body>
                    {this.props.styleTags}
                    <Main/>
                    <NextScript/>
                    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet"/>
                </body>
            </Html>
        );
    }
}