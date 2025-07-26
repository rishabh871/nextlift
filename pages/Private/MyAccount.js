import React,{useEffect,useState} from "react";
import Head from "next/head";
import moment from "moment";
import styled from "styled-components";
import {getServerProps} from "@utils/authUtils";
import sweetAlertHelper from "@helpers/SweetAlert";
import BackendLayout from "@components/Layouts/Backend";
import {PROFILE,SUBSCRIPTIONS} from "@constants/ApiConstant";
import {API_STATUS,APP_NAME,BASE_URL,TOAST_OPTIONS} from "@constants/Common";
import axios from "@utils/axios";
import colors from "@constants/Colors";
import {toast} from "react-toastify";
import ChangeCardModel from "@components/ChangeCardModel";
import ChangeAddressModel from "@components/ChangeAddressModel";
import {amexIcon,dinerIcon,discoverIcon,jcbIcon,masterCardIcon,unionPayIcon,visaIcon,eloIcon} from "@helpers/Icons";
import CustomHeading from "@components/styled/Heading";
const AccountWrap = styled.div`
    display:flex;flex-direction:column;width:100%;margin:0 auto;padding:40px;box-sizing:border-box;column-gap:40px;background:${colors.SECONDARY};${({ borderRadius }) => borderRadius && `border-radius: ${borderRadius};`}
    & .billing-wrap{
        display:flex;flex-direction:column;row-gap:20px;box-sizing:border-box;position:relative;
        & .incomplete-plan{font-size:18px;font-weight:600;color:${colors.RED};}
        & .detail-wrap{
            display:flex;flex-direction:column;box-sizing:border-box;
            & .name{font-size:20px;line-height:26px;font-weight:500;margin:0 0 10px;color:${colors.WHITE};}
            & .email{font-size:16px;line-height:20px;font-weight:400;margin:0 0 5px;color:${colors.WHITE};}
            & .phone{font-size:16px;line-height:20px;font-weight:400;margin:0 0 5px;color:${colors.WHITE};}
            & .pass{font-size:16px;line-height:20px;font-weight:400;margin:0 0 15px;color:${colors.WHITE};}
        }
        & .plan-wrap{
            & .heading{
                font-size:18px;font-weight:600;margin-bottom:15px;color:${colors.WHITE};
                & .change-plan-option{cursor:pointer;color:${colors.RED};}
            }
            & .price{
                display:flex;align-items:flex-end;margin-bottom:15px;color:${colors.WHITE};
                & .price-value{font-size:30px;line-height:1;font-weight:600;color:${colors.WHITE};}
                & .price-text{font-size:14px;font-weight:400;color:${colors.WHITE};}
            }
            & .next-billing-wrap{
                display:flex;column-gap:8px;margin-bottom:15px;font-size:16px;color:${colors.WHITE};
                & strong{font-weight:600;}
                & span{font-weight:400;}
            }
            & ul{
                margin:0 0 20px;padding-left:25px;display:flex;flex-direction:column;row-gap:7px;list-style-image:url('/assets/images/check.svg');
                & li{font-size:16px;line-height:24px;color:#4e4e4e;padding:0;color:${colors.WHITE};}
            }
            & .btn{
                width:85px;color:${colors.WHITE};background:${colors.green};border:1px solid ${colors.green};cursor:pointer;padding:10px;border-radius:6px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:14px;
                &:hover{background:${colors.RED};border-color:${colors.RED};}
            }
        }
        & .card-wrap{
            display:flex;flex-direction:column;
            & .heading{font-size:18px;font-weight:600;margin-bottom:15px;color:${colors.WHITE};}
            & .billing-address{color:${colors.WHITE};}
            & .card-info-wrap{
                display:flex;column-gap:20px;border:1px solid #d7d1d173;border-radius:10px;padding:20px;align-items:center;align-self:flex-start;
                & .brand-name{color:${colors.WHITE};font-size:22px;line-height:26px;font-weight:600;}
                & .brand-icon{display:flex;}
                & .card-info{
                    flex:1;
                    & .name{
                        margin:0 0 5px;font-size:16px;font-weight:500;display:flex;align-items:center;column-gap:5px;color:${colors.WHITE};
                        & span{
                            &.brand{text-transform:capitalize;}
                            &.type{border:1px solid ${colors.WHITE};border-radius:20px;padding:2px 8px;font-weight:400;font-size:10px;color:${colors.WHITE};}
                        }
                    }
                    & .exp{font-size:15px;color:${colors.WHITE};}
                }
            }
            & .actions{
                margin-top:15px;
                & .btn{
                    cursor:pointer;color:${colors.WHITE};background:${colors.GREEN};border:1px solid ${colors.GREEN};padding:10px 15px;border-radius:6px;font-size:14px;
                    &:hover{background:${colors.RED};border-color:${colors.RED};}
                }
            }
        }
    }
    @media (max-width:767px){
        padding:25px;
    }
`;
const MyAccount = ({currentUser}) => {
    const [customerAddress,setCustomerAddress] = useState(null);
    const [card,setCard] = useState(null);
    const [plan,setPlan] = useState(null);
    const [user,setUser] = useState(null);
    const [changeCard,setChangeCard] = useState(false);
    const [changeAddress,setChangeAddress] = useState(false);
    useEffect(() => {
        window.scrollTo(0,0);
        getUserCards();
    },[]);
    const getUserCards = async() => {
        try{
            const {data} = await axios.get(PROFILE.CARDS);
            if(data.status == API_STATUS.SUCCESS){
                setCard(data.card);
                setPlan(data.plan);
                setUser(data.user);
                setCustomerAddress(data.customerAddress);
            }
        }catch(e){
            console.log(e);
        }
    }
    const userCancelSubscriptions = async() => {
        sweetAlertHelper({title: '<strong>Confirm</strong>',html: `Are you sure you want to cancel the subscription?`,showCancelButton: true}).then((result) => {
            if(result.isConfirmed){
                cancelSubscriptions()
            }
        }); 
    }
    const cancelSubscriptions = async() => {
        try{
            const {data} = await axios.get(SUBSCRIPTIONS.CANCEL);
            if(data.status == API_STATUS.SUCCESS){
                sweetAlertHelper({title: '<strong>Success</strong>',html: data.message,showCancelButton: false}).then((result) => {
                    if(result.isConfirmed){
                        window.location.reload();
                    }
                }); 
            }else if(data.status == API_STATUS.PRECONDITION_FAILED){
                sweetAlertHelper({title: '<strong>Error</strong>',html: data.errors.message,showCancelButton: false});
            }else{
                toast.error(data.message,TOAST_OPTIONS);
            }
            updateUserCookies();
            document.getElementById("custom-loader").style.display = "none";
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    const showCancelBtn = () => {
        if(user.stripe_subscription_end_date){
            return false;
        }
        if(!user.membership_id || (user.membership_id == 1 || user.upcoming)){
            return false;
        }
        return true;
    }
    const showStatusMessage = () => {
        if(user?.last_subscription_status == 'incomplete'){
            return <span className='incomplete-plan'>( Verification Pending )</span>;
        }else if(user?.last_subscription_status == 'incomplete_expired'){
            return <span className='incomplete-plan'>( Payment Denied )</span>;
        }
        return "";
    }
    const handleRedirection = () => {
        if(user?.current_subscription_status == 'incomplete'){
            sweetAlertHelper({title: '<strong>Confirm</strong>',html: `Please update your payment information. If you haven't updated the payment information, your subscription will automatically convert to the Free Package.`});
        }else if(user?.last_subscription_status == 'incomplete'){
            sweetAlertHelper({title: '<strong>Confirm</strong>',html: `You cannot change plan until payment verification is done`});
        }else{
            window.location = `${BASE_URL}/user/change-plan`;
        }
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`My Account - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="my-account">
                {changeCard && (
                    <ChangeCardModel user={currentUser} customerAddress={customerAddress} updateAddr={setCustomerAddress} updateCard={setCard} modalAction={setChangeCard}/>
                )}
                {changeAddress && (
                    <ChangeAddressModel user={currentUser} customerAddress={customerAddress} updateAddr={setCustomerAddress} modalAction={setChangeAddress}/>
                )}
                <AccountWrap borderRadius={user && user.current_subscription_status == "incomplete" ? "" : "10px"}>
                    {currentUser && (  
                        <div className="billing-wrap">
                            <CustomHeading>My Account {showStatusMessage()}</CustomHeading>
                            <div className="detail-wrap">
                                <div className="name">{currentUser.name}</div>
                                <div className="email">{currentUser.email}</div>
                                <div className="phone">{currentUser.phone}</div>
                            </div>
                            {plan && (
                                <div className="plan-wrap">
                                    <div className="heading">{plan.name} Plan <span className='change-plan-option' onClick={handleRedirection}>( Change Plan )</span></div>
                                    <div className="price">
                                        <span className="price-value">{plan.price == 0 ? "Free" : `$${parseInt(plan.price)}`}</span>
                                        {plan.price > 0 && (
                                            <span className="price-text">per {plan.type}</span>
                                        )}
                                    </div>
                                    {user.upcoming && (
                                        <div className="next-billing-wrap">
                                            <strong>Upcoming Plan:</strong>
                                            <span>{user.upcomingPlanName}</span>
                                        </div>
                                    )}
                                    {(currentUser.nextBillingDate && !user.upcoming) && (
                                        <div className="next-billing-wrap">
                                            <strong>Next Billing Date:</strong>
                                            <span>{moment(currentUser.nextBillingDate).format('MMM DD, YYYY')}</span>
                                        </div>
                                    )}
                                    {showCancelBtn() && (
                                        <span className="btn" type="button" onClick={userCancelSubscriptions}>Cancel Plan</span>
                                    )}
                                </div>
                            )}
                            {(customerAddress && user.membership_id > 1) && (
                                <div className="card-wrap">
                                <div className="heading">Billing Address</div>
                                <div className="billing-address">{customerAddress.line1}, {customerAddress.city}, {customerAddress.state}, {customerAddress.postal_code}</div>
                                <div className="actions">
                                    {!changeAddress && (
                                        <button className="btn" type="button" onClick={() => setChangeAddress(true)}>Change</button>
                                    )}
                                </div>
                            </div>
                            )}
                            {(card && card.brand && user.membership_id > 1) && (
                                <div className="card-wrap">
                                    <div className="heading">Payment</div>
                                    <div className="card-info-wrap">
                                        {card.brand == "amex" && (
                                            <div className="brand-icon">{amexIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "diners" && (
                                            <div className="brand-icon">{dinerIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "discover" && (
                                            <div className="brand-icon">{discoverIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "jcb" && (
                                            <div className="brand-icon">{jcbIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "mastercard" && (
                                            <div className="brand-icon">{masterCardIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "unionpay" && (
                                            <div className="brand-icon">{unionPayIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "visa" && (
                                            <div className="brand-icon">{visaIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "elo" && (
                                            <div className="brand-icon">{eloIcon({width:40,height:32})}</div>
                                        )}
                                        {card.brand == "unknown" && (
                                            <div className="brand-name">{card.brand}</div>
                                        )}
                                        <div className="card-info">
                                            <div className="name">ending in {card.last4}<span className='type'>Default</span></div>
                                            <div className="exp">Expiry: {card.exp_month}/{card.exp_year}</div>
                                        </div>
                                    </div>
                                    <div className="actions">
                                        {!changeCard && (
                                            <button className="btn" type="button" onClick={() => setChangeCard(true)}>Change</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </AccountWrap>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    return getServerProps(context,{},"MY_ACCOUNT:VIEW",{isMembership:true});
}
export default MyAccount;