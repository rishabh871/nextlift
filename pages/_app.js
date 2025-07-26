import Head from "next/head";
import ErrorBoundary from "@components/ErrorBoundary";
import {loaderIcon} from "@helpers/Icons";
import {ToastContainer} from "react-toastify";
import colors from "@constants/Colors";
import "react-toastify/dist/ReactToastify.css";

export default function App({Component,pageProps}){
    return (
        <>
            <Head/>
            <div id="custom-loader">
                <div className="inner">{loaderIcon({width:40,height:40,stroke:colors.WHITE})}</div>
            </div>
            <ErrorBoundary>
                <Component {...pageProps}/>
            </ErrorBoundary>
            <ToastContainer/>
        </>
    );
  }