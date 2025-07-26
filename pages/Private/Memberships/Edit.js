import React,{useEffect} from "react";
import Head from "next/head";
import styled from "styled-components";
import axiosApi from "axios";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import {MEMBERSHIPS} from "@constants/ApiConstant";
import {handleUnauthorized} from "@helpers/Frontend";
import CustomHeading from "@components/styled/Heading";
import AddEditMembership from "@components/AddEditMembership";
const Wrapper = styled.div`
    display:flex;flex-direction:column;row-gap:30px;
`;
const EditMembership = ({membershipData}) => {
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
    return (
        <React.Fragment>
            <Head>
                <title>{`Edit Membership - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="memberships">
                <Wrapper>
                    <CustomHeading>Edit Membership</CustomHeading>
                    <AddEditMembership membershipData={membershipData}/>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    const {params} = context.req;
    let membershipData = {id: "",slug: "",name: "",stripe_product_id: "",stripe_price_id: "",price: "",type: "",position: "",banner: "",description: "",is_free: false};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(`${MEMBERSHIPS.VIEW}/${params.slug}`,{headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            membershipData = data.membership;
        }else{
            context.res.writeHead(API_STATUS.FOUND,{location:`${BASE_URL}/admin/memberships`});
            context.res.end();
            return {props: {}};
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{membershipData},"MEMBERSHIPS:EDIT");
}
export default EditMembership;