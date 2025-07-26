import React,{useEffect,useState} from 'react';
import styled from "styled-components";
import axios from '@utils/axios';
import {toast} from 'react-toastify';
import {AUTH,PROFILE} from '@constants/ApiConstant';
import {API_STATUS,COUNTRY_CODES,STRIPE,TOAST_OPTIONS} from '@constants/Common';
import colors from '@constants/Colors';
import {loadStripe} from '@stripe/stripe-js';
import {Elements,useStripe,useElements,CardNumberElement,CardExpiryElement,CardCvcElement} from "@stripe/react-stripe-js";
import {focusOnFeild,hasValidationError,validationError} from "@helpers/Frontend";
import {crossIcon} from "@helpers/Icons";
const stripePromise = loadStripe(STRIPE.PUBLIC_KEY);
const MWrapper = styled.div`
    position:fixed;top:0;bottom:0;left:0;right:0;z-index:999;display:flex;justify-content:center;align-items:center;
    & .back{position:absolute;left:0;top:0;right:0;bottom:0;background:#0000007a;}
    & .inner{
        background:${colors.SECONDARY};z-index:999;max-width:550px;width:calc(100% - 40px);position:relative;border-radius:17px;overflow:hidden;
        & .header{
            display:flex;align-items:center;column-gap:20px;justify-content:space-between;padding:15px 25px;background:${colors.PRIMARY};border-radius:17px 17px 0 0;
            & span{font-size:22px;line-height:25px;font-weight:700;color:${colors.WHITE};}
            & .close{
                cursor:pointer;z-index:1;width:25px;height:25px;padding:0;display:flex;align-items:center;justify-content:center;border:none;border-radius:20px;background:${colors.WHITE};
                & svg{fill:${colors.RED};}
            }
        }
        & .body{
            padding:25px;display:flex;flex-direction:column;max-height:60vh;overflow:hidden;overflow-y:auto;font-size:14px;line-height:24px;
            &::-webkit-scrollbar{width:6px;}
            &::-webkit-scrollbar-track{box-shadow:inset 0 0 6px #E2EFF6;}
            &::-webkit-scrollbar-thumb{background:#aaa;border-radius:10px;}
            &::-webkit-scrollbar-thumb:hover{background:#aaa;}
            & .heading{margin-bottom:10px;font-size:18px;color:${colors.WHITE};font-weight:500;}
            & .custform-group{border:1px solid ${colors.BORDER};background:${colors.SECONDARY};padding:0 15px;border-radius:6px;box-sizing:border-box;}
            & .desText{margin:0 0 15px;font-size:16px;color:${colors.WHITE};}
            & .btn-actn-wrap{
                display:flex;align-items:center;column-gap:10px;margin-top:20px;justify-content:center;
                & .btn-apply{
                    text-decoration:none;display:flex;align-items:center;justify-content:center;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.GREEN};color:${colors.WHITE};border-radius:10px;cursor:pointer;
                    &:hover{background:${colors.RED};}
                }
                & .btn-clear{text-decoration:none;display:flex;align-items:center;justify-content:center;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:10px;cursor:pointer;}
            }
        }
    }
    @media (max-width:767px){
        & .inner{
            & .header{
                padding:15px 20px;
                & span{font-size:18px;line-height:26px;}
            }
            & .body{padding:20px;}
        }
    }
`;
const ChangeCardModel = ({modalAction,user,customerAddress,updateAddr,updateCard}) => {
    return (
        <MWrapper>
            <div className="back" onClick={() => modalAction(false)}></div>
            <div className="inner">
                <div className="header">
                    <span>Change Card</span>
                    <button onClick={() => modalAction(false)} className="close">{crossIcon({width:18,height:18})}</button>
                </div>
                <div className="body">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm modalAction={modalAction} user={user} customerAddress={customerAddress} updateAddr={updateAddr} updateCard={updateCard}/>
                    </Elements>
                </div>
            </div>
        </MWrapper>
    );
}
export default ChangeCardModel;
const elementOptions = {
    style: {
        base: {
            backgroundColor: colors.SECONDARY,
            color: colors.WHITE,
            fontFamily: 'Lato,sans-serif',
            fontSize: "16px",
            fontSmoothing: 'antialiased',
            fontWeight: '400',
            lineHeight: "40px",
            iconColor: colors.WHITE,
            "::placeholder": {
                color: colors.WHITE
            }
        },
        invalid: {
            color: colors.RED,
            "::placeholder": {
                color: colors.RED
            }
        }
    },
    showIcon: true
};
export const CheckoutForm = ({user,customerAddress,modalAction,updateAddr,updateCard}) => {
    const elements = useElements();
    const stripe = useStripe();
    const [states,setStates] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const [errors,setErrors] = useState([]);
    const [form,setForm] = useState({
        card_holder_name: user.name,
        street: customerAddress.line1,
        city: customerAddress.city,
        state: customerAddress.state,
        zipcode: customerAddress.postal_code,
        paymentId: "",
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false
    });
    useEffect(() => {
        getStates();
    },[]);
    const getStates = async() => {
        try{
            const {data} = await axios.get(AUTH.STATES);
            if(data.status === API_STATUS.SUCCESS){
                setStates(data.states);
            }
        }catch(e){
            console.log(e);
        }
    }
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "zipcode"){
            let newValue = value.replace(/[^0-9]/gi,'');
            if(newValue.length <= 5){
                handleCustom(name,newValue);
            }
        }else{
            handleCustom(name,value);
        }
    }
    const handleCardElementOnChange = (e) => {
        if(e.error){
            setErrors({...errors,[e.elementType]: e.error.message});
        }else{
            setErrors({...errors,[e.elementType]: ""});
        }
        setForm({...form,[e.elementType]: e.complete});
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if(submitting){
            return;
        }
        if(!validate()){
            return;
        }
        handleSubmit();
    }
    const validate = () => {
        const newError = {};
        let positionFocus = "";
        if(!form.card_holder_name || !form.card_holder_name.trim()){
            newError["card_holder_name"] = "Required";
            positionFocus = positionFocus || "card_holder_name";
        }else if(form.card_holder_name && form.card_holder_name.length > 100){
            newError["card_holder_name"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "card_holder_name";
        }
        if(!form.street){
            newError["street"] = "Required";
            positionFocus = positionFocus || "street";
        }else if(form.street && form.street.length > 255){
            newError["street"] = "Maximum 255 characters allowed";
            positionFocus = positionFocus || "street";
        }
        if(!form.city){
            newError["city"] = "Required";
            positionFocus = positionFocus || "city";
        }else if(form.city && form.city.length > 100){
            newError["city"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "city";
        }
        if(!form.state){
            newError["state"] = "Required";
            positionFocus = positionFocus || "state";
        }else if(form.state && form.state.length > 100){
            newError["state"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "state";
        }
        if(!form.zipcode){
            newError["zipcode"] = "Required";
            positionFocus = positionFocus || "zipcode";
        }
        if(errors.cardNumber){
            newError["cardNumber"] = errors.cardNumber;
            positionFocus = positionFocus || "cardNumber";
        }else if(!form.cardNumber){
            newError["cardNumber"] = "Required";
            positionFocus = positionFocus || "cardNumber";
        }
        if(errors.cardExpiry){
            newError["cardExpiry"] = errors.cardExpiry;
            positionFocus = positionFocus || "cardExpiry";
        }else if(!form.cardExpiry){
            newError["cardExpiry"] = "Required";
            positionFocus = positionFocus || "cardExpiry";
        }
        if(errors.cardCvc){
            newError["cardCvc"] = errors.cardCvc;
            positionFocus = positionFocus || "cardCvc";
        }else if(!form.cardCvc){
            newError["cardCvc"] = "Required";
            positionFocus = positionFocus || "cardCvc";
        }
        setErrors(newError);
        if(positionFocus){
            focusOnFeild(positionFocus);
            return false;
        }
        return true;
    }
    const handleCustom = (name,value) => {
        setForm((prevState) => ({...prevState,[name]: value}));
    }
    const handleSubmit = async() => {
        const card = elements.getElement(CardNumberElement);
        if(card == null){
            return;
        }
        setSubmitting(true);
        const {error,paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card,
            billing_details: {
                name: form.card_holder_name,
                email: user.email,
                address: {
                    line1: form.street,
                    city: form.city,
                    state: form.state,
                    country: COUNTRY_CODES.AU,
                    postal_code: form.zipcode
                }
            }
        });
        if(!error){
            try{
                const {id} = paymentMethod;
                form["paymentId"] = id;
                document.getElementById("custom-loader").style.display = "block";
                const {data} = await axios.post(PROFILE.CHANGE_CARD,form);
                if(data.status === 200){
                    setSubmitting(false);
                    document.getElementById("custom-loader").style.display = "none";
                    setForm({card_holder_name: '',street: '',city: '',state: '',zipcode: '',paymentId: "",cardNumber: false,cardExpiry: false,cardCvc: false});
                    updateAddr(data.customerAddress);
                    updateCard(data.customerCard);
                    modalAction(false);
                    window.location.reload();
                }else if(data.status == 422){
                    document.getElementById("custom-loader").style.display = "none";
                    setSubmitting(false);
                    setErrors(data.errors);
                }else if(data.status == 412){
                    document.getElementById("custom-loader").style.display = "none";
                    setSubmitting(false);
                    toast.error(data.errors.message,TOAST_OPTIONS);
                }else{
                    document.getElementById("custom-loader").style.display = "none";
                    setSubmitting(false);
                    toast.error(data.message,TOAST_OPTIONS);
                }
            }catch(e){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                toast.error("Something went wrong. Please try again later.",TOAST_OPTIONS);
            }
        }else{
            setSubmitting(false);
            document.getElementById("custom-loader").style.display = "none";
            toast.error(error.message,TOAST_OPTIONS);
        }
    }
    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <p className='desText'>This card will be charged on this day each month as long as subscription is active.</p>
            <div className="form-group">
                <label className="label">Card Number</label>
                <div className={errors.cardNumber ? "has-input-error custform-group" : "custform-group"}>
                    <CardNumberElement options={elementOptions} onChange={handleCardElementOnChange}/>
                </div>
                {hasValidationError(errors,"cardNumber") ? (<span className="has-cust-error">{validationError(errors,"cardNumber")}</span>) : null}
            </div>
            <div className="row-group">
                <div className="form-group">
                    <label className="label">Expiration Date</label>
                    <div className={errors.cardExpiry ? "has-input-error custform-group" : "custform-group"}>
                        <CardExpiryElement options={elementOptions} onChange={handleCardElementOnChange}/>
                    </div>
                    {hasValidationError(errors,"cardExpiry") ? (<span className="has-cust-error">{validationError(errors,"cardExpiry")}</span>) : null}
                </div>
                <div className="form-group">
                    <label className="label">CVC</label>
                    <div className={errors.cardCvc ? "has-input-error custform-group" : "custform-group"}>
                        <CardCvcElement options={elementOptions} onChange={handleCardElementOnChange}/>
                    </div>
                    {hasValidationError(errors,"cardCvc") ? (<span className="has-cust-error">{validationError(errors,"cardCvc")}</span>) : null}
                </div>
            </div>
            <div className="form-group">
                <label className="label">Card Holder Name</label>
                <input className={hasValidationError(errors,"card_holder_name") ? "has-input-error" : ""} type="text" name="card_holder_name" onChange={onChange} value={form.card_holder_name} autoComplete="off"/>
                {hasValidationError(errors,"card_holder_name") ? (<span className="has-cust-error">{validationError(errors,"card_holder_name")}</span>) : null}
            </div>
            <div className='heading'>Billing Address</div>
            <div className="row-group">
                <div className="form-group">
                    <label className="label">Street</label>
                    <input className={hasValidationError(errors,"street") ? "has-input-error" : ""} type="text" name="street" onChange={onChange} value={form.street} autoComplete="off"/>
                    {hasValidationError(errors,"street") ? (<span className="has-cust-error">{validationError(errors,"street")}</span>) : null}
                </div>
                <div className="form-group">
                    <label className="label">City</label>
                    <input className={hasValidationError(errors,"city") ? "has-input-error" : ""} type="text" name="city" onChange={onChange} value={form.city} autoComplete="off"/>
                    {hasValidationError(errors,"city") ? (<span className="has-cust-error">{validationError(errors,"city")}</span>) : null}
                </div>
            </div>
            <div className="row-group">
                <div className="form-group">
                    <label className="label">State</label>
                    <select name="state" className={hasValidationError(errors,"state") ? "has-input-error rt-cust-select" : "rt-cust-select"} onChange={onChange} value={form.state} autoComplete="off">
                        <option value="">Select</option>
                        {states.length > 0 ? states.map((state) => (
                            <option key={state.id} value={state.name}>{state.name}</option>
                        )) : null}
                    </select>
                    {hasValidationError(errors,"state") ? (<span className="has-cust-error">{validationError(errors,"state")}</span>) : null}
                </div>
                <div className="form-group">
                    <label className="label">Zipcode</label>
                    <input className={hasValidationError(errors,"zipcode") ? "has-input-error" : ""} type="text" name="zipcode" onChange={onChange} value={form.zipcode} autoComplete="off"/>
                    {hasValidationError(errors,"zipcode") ? (<span className="has-cust-error">{validationError(errors,"zipcode")}</span>) : null}
                </div>
            </div>
            <div className="btn-actn-wrap">
                {!submitting ? (
                    <button className="btn-apply" type="submit">Change Card</button>
                ) : (
                    <button className="btn-apply" type="button">Loading ...</button>
                )}
                <button className="btn-clear" type="button" onClick={() => modalAction(false)}>Cancel</button>
            </div>
        </form>
    );
}