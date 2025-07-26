import React,{useEffect} from "react";
import Head from "next/head";
import {APP_NAME} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import AddEditPage from "@components/AddEditPage";
const AddPage = ({pageData}) => {
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
    return (
        <React.Fragment>
            <Head>
                <title>{`Add CMS Page - ${APP_NAME}`}</title>
            </Head>
            <AddEditPage pageData={pageData} hasNewPage={true}/>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    let pageData = {name: "",page_components: [{"layout":"One Column","columns":[{"width":100,"components":[{"type":"editor","text":""}]}]}],contact_email: "",contact_phone: "",contact_address: "",contact_is_map_visible: false,contact_map_url: "",meta_title: "",meta_description: "",template: "default"};
    return getServerProps(context,{pageData},"PAGES:ADD");
}
export default AddPage;