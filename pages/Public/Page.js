import React,{useEffect} from "react";
import Head from "next/head";
import axios from "axios";
import {getServerProps} from "@utils/authUtils";
import {APP_NAME,API_STATUS,BASE_URL} from "@constants/Common";
import {handleUnauthorized,handleForbidden} from "@helpers/Frontend";
import Frontend from "@components/Layouts/Frontend";
import Breadcrumbs from "@components/Breadcrumbs";
import {PAGES} from "@constants/ApiConstant";
import PageWrap from "@components/PageWrap";
const Page = ({pageData}) => {
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
    return (
        <React.Fragment>
            <Head>
                <title>{pageData.meta_title}</title>
                <meta name="description" content={pageData.meta_description}/>
                <meta name="keywords" content=""/>
                <meta name="author" content={APP_NAME}/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content={pageData.meta_title}/>
                <meta property="og:description" content={pageData.meta_description}/>
                <meta property="og:url" content={`${BASE_URL}/${pageData.link}`}/>
                <meta property="og:site_name" content={APP_NAME}/>
                <meta property="og:image" content={`${BASE_URL}/assets/images/logo.png`}/>
                <link rel="canonical" href={`${BASE_URL}/${pageData.link}`}/>
            </Head>
            <Frontend page={pageData.link}>
                <Breadcrumbs title={pageData.name}/>
                <PageWrap pageData={pageData}/>
            </Frontend>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    const {params} = context.req;
    let pageData = null;
    try{
        const {data} = await axios.get(`${PAGES.WEBPAGE}/${params.slug}`);
        if(data.status == API_STATUS.SUCCESS){
            pageData = data.page;
        }else if(data.status == API_STATUS.PRECONDITION_FAILED){
            return handleForbidden(context.res);
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{pageData});
}
export default Page;