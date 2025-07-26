import React,{useEffect,useState} from 'react';
import {API_STATUS,BASE_URL,DEFAULT_IMAGE_URL,TOAST_OPTIONS,WIDTH} from '@constants/Common';
import colors from '@constants/Colors';
import styled from 'styled-components';
import axios from '@utils/axios';
import {AUTH} from '@constants/ApiConstant';
import {toast} from 'react-toastify';
import CustomHeading from "@components/styled/Heading";
import {Splide,SplideSlide} from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
const Wrapper = styled.div`
    width:100%;position:relative;max-width:${WIDTH};margin:0 auto;padding:40px 60px;display:flex;flex-direction:column;box-sizing:border-box;row-gap:30px;justify-content:center;
    & .card-container{display:flex;column-gap:40px;box-sizing:border-box;}
    @media (max-width:1279px){
        padding:40px 30px 20px;width:100%;
    }
    @media (max-width:1199px){
        & .card-container{column-gap:20px;}
    }
    @media (max-width:991px){
        padding:40px 30px;width:100%;
        & .card-container{column-gap:20px;}
    }
    @media (max-width:767px){
        .card-container{
            display:flex;width:100%;flex-direction:column;row-gap:40px;align-items:center;
            & .splide--slide{max-width:400px;width:100%;}
        }
    }
`;
const Card = styled.div`
    padding-bottom:30px;position:relative;background:${colors.SECONDARY};width:100%;height:100%;border-radius:20px;transition:.2s;overflow:hidden;
    & .card-img{width:100%;}
    & .card-heading{
        text-align:center;
        & h2{margin:0;color:${colors.RED};font-weight:500;font-size:22px;}
        & hr.solid{
            display:block;border:0;width:90px;border-radius:10px;border-top:5px solid ${colors.RED};margin:15px auto 20px;padding:0;
        }
    }
    & .plan-price{
        margin-bottom:15px;
        & .price-wrap{
            font-size:14px;color:${colors.WHITE};margin:0;line-height:20px;text-align:center;
            & span{font-weight:600;font-size:18px;line-height:24px;}
        }
    }
    & .card-body{
        background:${colors.SECONDARY};border-radius:20px;position:relative;padding:20px 30px 0;
        & .card-desc{
            padding:20px 0 0 0;
            & h3{font-size:17px;color:${colors.WHITE};text-align:center;margin:0 0 10px;font-weight:500;}
            & ul{
                margin:0;list-style:none;color:${colors.WHITE};padding:0 0 0 15px;list-style:disc;
                & li{font-size:16px;line-height:24px;}
                & p{font-size:16px;line-height:22px;margin:5px 0 0px;;}
            }   
        }
        & .select-btn{
            display:flex;align-items:center;justify-content:center;margin:5px auto 0;padding:0;height:45px;font-size:20px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:10px;font-weight:500;cursor:pointer;align-self:center;width:130px;line-height:22px;
            &:hover{background:${colors.GREEN};}
            &:disabled{opacity:0.6;background:${colors.GRAY};}
        } 
            
    }
    @media (max-width:1199px){
        & .card-body{padding:20px 30px 0 30px;margin-top:-20px;}
    }
    @media (max-width:991px){
        padding-bottom:5px;
        & .card-body{
            padding:20px;
            & .card-heading{
                & h2{font-size:18px}
                & hr.solid{margin:15px auto 15px;}
            }
            & .card-desc{
                & h3{font-size:14px;}
                & ul{
                    & li{font-size:14px;line-height:22px;}
                    & p{font-size:14px;line-height:22px;margin:0;}
                }
            }
        }
    }
    @media (max-width:767px){
        max-width:400px;width:100%;margin:auto;
        & .card-body{padding:25px;}
    }
`;
const Plan = ({handlePlanType,change}) => {
    const [memberships,setMemberships] = useState([]);
    const [isPlanChange,setIsPlanChange] = useState(true);
    const options = {
        type: "slide",
        autoplay: false,
        interval: 3000,
        pauseOnHover: true,
        arrows: false,
        pagination: false,
        perPage: 3,
        perMove: 1,
        gap: "30px",
        breakpoints: {
            991: {arrows: true,perPage: 2},
            767: {arrows: true,perPage: 1}
        }
    }
    useEffect(() => {
        document.getElementById("custom-loader").style.display = "block";
        getMemberShipPlans()
    },[])
    const getMemberShipPlans = async() => {
        try{
            const {data} = await axios.get(AUTH.MEMBERSHIPS);
            if(data.status === API_STATUS.SUCCESS){
                // if(data.user.current_subscription_status == 'incomplete' || data.user.last_subscription_status == 'incomplete'){
                //     window.location = `${BASE_URL}/forbidden`;
                // }
                setIsPlanChange(data.isPlanDown)
                setMemberships(data.memberships);
            }else if(data.status === API_STATUS.PRECONDITION_FAILED){
                toast.error(data.errors.message,TOAST_OPTIONS);
            }
            document.getElementById("custom-loader").style.display = "none";
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    const renderHTML = (rawHTML) => {
        return (
            <div className='card-desc' dangerouslySetInnerHTML={{__html: rawHTML}}></div>
        )
    }
    const handlePlanStatus = (plan) => {
        if(isPlanChange){
            handlePlanType(plan)
        }else{
            toast.error("You have already changed your plan once. Please wait for those changes to take effect.",TOAST_OPTIONS);
        }
    }
    return (
        <Wrapper dataLength={memberships && memberships.length}>
            <CustomHeading align="center">User {change ? 'Plan' : 'Registration'} Options</CustomHeading>
            <div className='card-container'>
                <Splide options={options}>
                    {memberships && memberships.length > 0 && memberships.map((plan,index) => (
                        <SplideSlide key={index}>
                            <Card key={index}>
                                <img src={plan.banner || DEFAULT_IMAGE_URL} className="card-img" alt="player"/>
                                <div className='card-body'>
                                    <div className='card-heading'>
                                        <h2>{plan.name || ""}</h2>
                                        <hr className='solid'/>
                                    </div>
                                    <div className="plan-price">
                                        <div className="price-wrap"><span>{plan.price == 0 ? "Free" : `$${parseInt(plan.price)}`}</span> {plan.price ? '/ month' : ""}</div>
                                    </div>
                                    {(plan.is_subscribed || plan.is_upcoming) ? (
                                        <button className="select-btn" disabled>{plan.user_plan_status == "active" || plan.user_plan_status == "trialing" ? "Selected" : "Upcoming"}</button>
                                    ) : (
                                        <button className="select-btn" onClick={() => handlePlanStatus(plan)}>Select</button>
                                    )}
                                    {plan.description ? renderHTML(plan.description) : null}
                                </div>
                            </Card>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>
        </Wrapper>
    )
}
export default Plan;