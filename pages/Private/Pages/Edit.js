import React,{useEffect} from "react";
import Head from "next/head";
import axiosApi from "axios";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import {PAGES} from "@constants/ApiConstant";
import {handleUnauthorized} from "@helpers/Frontend";
import AddEditPage from "@components/AddEditPage";
const EditPage = ({pageData}) => {
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
    return (
        <React.Fragment>
            <Head>
                <title>{`Edit CMS Page - ${APP_NAME}`}</title>
            </Head>
            <AddEditPage pageData={pageData}/>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    const {params} = context.req;
    let pageData = {name: "",page_components: [{"layout":"One Column","columns":[{"width":100,"components":[{"type":"editor","text":""}]}]}],contact_email: "",contact_phone: "",contact_address: "",contact_is_map_visible: false,contact_map_url: "",meta_title: "",meta_description: "",template: "default"};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(`${PAGES.VIEW}/${params.slug}`,{headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            pageData = data.page;
        }else{
            context.res.writeHead(API_STATUS.FOUND,{location:`${BASE_URL}/admin/pages`});
            context.res.end();
            return {props: {}};
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{pageData},"PAGES:EDIT");
}
export default EditPage;