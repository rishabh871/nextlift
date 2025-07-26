import React,{useState} from "react";
import Head from "next/head";
import Cookies from 'js-cookie';
import {toast} from 'react-toastify';
import {getServerProps} from "@utils/authUtils";
import axios from "@utils/axios";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL,TOAST_OPTIONS} from "@constants/Common";
import FrontLayout from "@components/Layouts/Frontend";
import {PAYMENTS} from "@constants/ApiConstant";
import Plan from "@components/Payment/Plan";
import Checkout from "@components/Payment/Checkout"

const ChangePlan = ({currentUser}) => {
    const [planType,setPlanType] = useState(null);
    const handlePlanType = (type) => {
        if(type && type.is_free == 1){
            handleFreePlan(type);
        }else{
            setPlanType(type); 
        }
    }
    const handleFreePlan = async(plan) => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(PAYMENTS.FREE,{membership_id: plan.id});
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                Cookies.set(`${APP_SLUG}-user`,JSON.stringify(data.user));
                window.location = `${BASE_URL}/user/my-account`;
            }else if(data.status == API_STATUS.PRECONDITION_FAILED){
                document.getElementById("custom-loader").style.display = "none";
                toast.error(data.errors.message,TOAST_OPTIONS);
            }else{
                document.getElementById("custom-loader").style.display = "none";
                toast.error(data.message,TOAST_OPTIONS);
            }
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`Change Plan - ${APP_NAME}`}</title>
            </Head>
            {!planType ? (
                <FrontLayout>
                    <Plan handlePlanType={handlePlanType} user={currentUser} change={true}/>
                </FrontLayout> 
            ) : (
                <FrontLayout>
                    <Checkout handleType={handlePlanType} planType={planType} user={currentUser} change={true}/>
                </FrontLayout>
            )}
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    return getServerProps(context,{},"PAYMENT:VIEW",{isMember: true});
}
export default ChangePlan;