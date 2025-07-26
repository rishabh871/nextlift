import React,{useEffect,useState} from 'react';
import Cookies from 'js-cookie';
import {API_STATUS,APP_SLUG,BASE_URL,COUNTRY_CODES,TOAST_OPTIONS,WIDTH} from '@constants/Common';
import colors from '@constants/Colors';
import styled from 'styled-components';
import {hasValidationError,focusOnFeild,validationError} from "@helpers/Frontend"
import {useStripe,useElements,CardNumberElement,CardExpiryElement,CardCvcElement} from "@stripe/react-stripe-js";
import {AUTH,PAYMENTS} from '@constants/ApiConstant'
import axios from "@utils/axios";
import {toast} from 'react-toastify';
const CheckoutWrap = styled.form`
    max-width:${WIDTH};width:100%;margin:0 auto;display:flex;flex-direction:row;column-gap:30px;row-gap:30px;box-sizing:border-box;flex-wrap:wrap;padding-top:40px;padding-bottom:40px;
    & .step{
        display:flex;flex-direction:column;width:calc(33.33% - 20px);row-gap:20px;background:${colors.SECONDARY};padding:20px 20px 0;border-radius:7px;box-sizing:border-box;
        &.step1{row-gap:0;}
        &.step2{padding:20px;}
        & .custform-group{border:1px solid ${colors.BORDER};background:${colors.SECONDARY};padding:0 15px;border-radius:6px;box-sizing:border-box;}
        & .header-wrap{
            display:flex;flex-direction:column;
            &.mb15{margin-bottom:15px;}
            & .heading{
                cursor:pointer;display:flex;flex-direction:row;column-gap:15px;align-items:center;
                & .icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;font-size:18px;color:${colors.WHITE};background:${colors.RED};border-radius:30px;font-weight:600;}
                & .name{color:${colors.WHITE};font-size:20px;line-height:1;font-weight:600;}
            }
        }
        & .step-body{
            display:flex;flex-direction:column;position:relative;
            & .overlay{position:absolute;left:0;right:0;top:0;bottom:0;z-index:1;}
            & table{
                border:1px solid ${colors.BORDER};border-spacing:0;border-collapse:collapse;margin-bottom:20px;
                & th{border-bottom:1px solid ${colors.BORDER};padding:10px;vertical-align:middle;font-size:14px;line-height:1;font-weight:700;text-align:left;box-sizing:border-box;color:${colors.WHITE};}
                & td{border-bottom:1px solid ${colors.BORDER};padding:10px;vertical-align:middle;font-size:14px;line-height:1.2;color:${colors.WHITE};}
            }
            & .has-input-error input{border-color:${colors.RED} !important;}
            & .bi-cart-total{
                display:flex;flex-direction:column;row-gap:10px;
                & .bi-cart-total-line{
                    display:flex;justify-content:space-between;column-gap:20px;
                    & strong{font-size:14px;color:${colors.WHITE};}
                    & span{font-size:14px;color:${colors.WHITE};}
                }
            }
            & .bi-checkout-btn{cursor:pointer;background:${colors.RED};padding:15px;display:flex;align-items:center;justify-content:center;color:${colors.WHITE};font-size:18px;line-height:20px;border-radius:6px;text-decoration:none;margin:20px 0;border:none;}
        }
    }
    & .description{margin:0;color:${colors.WHITE};font-size:14px;line-height:20px;}
    & .padd15{padding:15px;}
    @media(max-width:1249px){
        padding:0;
        & .step{
            width:calc(50% - 15px);
            &.step1{
                width:100%;display:flex;flex-direction:row;column-gap:30px;
                & .step-inner{width:calc(50% - 15px);}
            }
        }
    }
    @media(max-width:899px){
        & .step{
            &.step1{
                flex-direction:column;
                & .step-inner{width:100%;}
            }
        }
    }
    @media(max-width:767px){
        flex-direction:column;
        & .step{width:100%;}
    }
    @media(max-width:479px){
        & .step{
            & .row-group{flex-direction:column;}
        }
    }
`;
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
const isFloat = (n) => {
    return n === +n && n !== (n|0);
}
const priceFormat = (price) => {
    let formatPrice = isFloat(price) ? parseFloat(price).toFixed(2) : parseInt(price);
    return `$${formatPrice}`;
}
const CheckoutForm = ({planType,user,change}) => {
    const elements = useElements();
    const stripe = useStripe();
    const [states,setStates] = useState([]);
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const [form,setForm] = useState({membership_id: planType.id,first_name: user.first_name,last_name: user.last_name,phone: "",email: user.email,street: "",city: "",state: "",zip: "",card_holder_name: "",cardNumber: false,cardExpiry: false,cardCvc: false});
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
        if(name == "zip"){
            let newValue = value.replace(/[^0-9]/gi,'');
            if(newValue.length <= 5){
                handleCustom(name,newValue);
            }
        }else{
            handleCustom(name,value);
        }
    }
    const handleCustom = (name,value) => {
        setForm((prevState) => ({...prevState,[name]: value}));
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if(submitting){
            return;
        }
        if(!stripe || !elements){
            return;
        }
        if(!validate()){
            return;
        }
        submit();
    }
    const submit = async() => {
        const card = elements.getElement(CardNumberElement);
        if(card == null){
            return;
        }
        document.getElementById("custom-loader").style.display = "block";
        setSubmitting(true);
        const {error,paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card,
            billing_details: {
                name: form.card_holder_name,
                email: form.email,
                address: {
                    line1: form.street,
                    city: form.city,
                    state: form.state,
                    country: COUNTRY_CODES.AU,
                    postal_code: form.zip
                }
            }
        });
        if(!error){
            try{
                const {id} = paymentMethod;
                form["payment_id"] = id;
                form["changed"] = (change ? 1 : 0);
                const {data} = await axios.post(PAYMENTS.PREMIUM,form);
                if(data.status === API_STATUS.SUCCESS){
                    document.getElementById("custom-loader").style.display = "none";
                    Cookies.set(`${APP_SLUG}-user`,JSON.stringify(data.user));
                    toast.success(data.message,TOAST_OPTIONS);
                    setTimeout(() => {
                        window.history.replaceState({},"Page","/");
                        window.location = `${BASE_URL}/user/my-account`;
                    },2000);
                }else if(data.status == API_STATUS.UNPROCESSABLE_ENTITY){
                    setSubmitting(false);
                    document.getElementById("custom-loader").style.display = "none";
                    setErrors(data.errors);
                }else{
                    setSubmitting(false);
                    document.getElementById("custom-loader").style.display = "none";
                    toast.error(data.message,TOAST_OPTIONS);
                }
            }catch(e){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                if(e.response && e.response.data.message){
                    toast.error(e.response.data.message,TOAST_OPTIONS);
                }
            }
        }else{
            setSubmitting(false);
            toast.error(error.message,TOAST_OPTIONS);
            document.getElementById("custom-loader").style.display = "none";
        }
    }
    const validate = () => {
        const newError = {};
        let positionFocus = "";
        const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!form.first_name || !form.first_name.trim()){
            newError["first_name"] = "Required";
            positionFocus = positionFocus || "first_name";
        }else if(form.first_name && form.first_name.length > 100){
            newError["first_name"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "first_name";
        }
        if(!form.last_name || !form.last_name.trim()){
            newError["last_name"] = "Required";
            positionFocus = positionFocus || "last_name";
        }else if(form.last_name && form.last_name.length > 100){
            newError["last_name"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "last_name";
        }
        if(!form.phone || !form.phone.trim()){
            newError["phone"] = "Required";
            positionFocus = positionFocus || "phone";
        }
        if(!form.email || !form.email.trim()){
            newError["email"] = "Required";
            positionFocus = positionFocus || "email";
        }else if(form.email && form.email.length > 100){
            newError["email"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "email";
        }else if(!emailRE.test(form.email)){
            newError["email"] = "Enter a valid email";
            positionFocus = positionFocus || "email";
        }
        if(!form.street || !form.street.trim()){
            newError["street"] = "Required";
            positionFocus = positionFocus || "street";
        }else if(form.street && form.street.length > 255){
            newError["street"] = "Maximum 255 characters allowed";
            positionFocus = positionFocus || "street";
        }
        if(!form.city || !form.city.trim()){
            newError["city"] = "Required";
            positionFocus = positionFocus || "city";
        }else if(form.city && form.city.length > 100){
            newError["city"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "city";
        }
        if(!form.state){
            newError["state"] = "Required";
            positionFocus = positionFocus || "state";
        }
        if(!form.zip || !form.zip.trim()){
            newError["zip"] = "Required";
            positionFocus = positionFocus || "zip";
        }
        if(!form.card_holder_name || !form.card_holder_name.trim()){
            newError["card_holder_name"] = "Required";
            positionFocus = positionFocus || "card_holder_name";
        }else if(form.card_holder_name && form.card_holder_name.length > 100){
            newError["card_holder_name"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "card_holder_name";
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
            positionFocus = positionFocus || "cardNumber";
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
    const handleCardElementOnChange = (e) => {
        if(e.error){
            setErrors({...errors,[e.elementType]: e.error.message});
        }else{
            setErrors({...errors,[e.elementType]: ""});
        }
        setForm({...form,[e.elementType]: e.complete});
    }
    const calculatedTotal = () => {
        let total = planType.price;
        return priceFormat(total);
    }
    return (
        <CheckoutWrap onSubmit={onSubmit}>
            <div className="step step1">
                <div className="step-inner">
                    <div className="header-wrap mb15">
                        <div className="heading">
                            <span className="icon">1</span>
                            <span className="name">Basic Information</span>
                        </div>
                    </div>
                    <div className="step-body">
                        <div className='row-group'>
                            <div className="form-group">
                                <label className="label">First Name</label>
                                <input className={hasValidationError(errors,"first_name") ? "has-input-error" : ""} type="text" name="first_name" value={form.first_name} onChange={onChange} />
                                {hasValidationError(errors,"first_name") ? <span className="has-cust-error">{validationError(errors,"first_name")}</span> : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Last Name</label>
                                <input className={hasValidationError(errors,"last_name") ? "has-input-error" : ""} type="text" name="last_name" value={form.last_name} onChange={onChange} autoComplete="off"/>
                                {hasValidationError(errors,"last_name") ? <span className="has-cust-error">{validationError(errors,"last_name")}</span> : null}
                            </div>
                        </div>
                        <div className='row-group'>
                            <div className="form-group">
                                <label className="label">Phone</label>
                                <input className={hasValidationError(errors,"phone") ? "has-input-error" : ""} type="text" name="phone" value={form.phone} onChange={onChange} autoComplete="off"/>
                                {hasValidationError(errors,"phone") ? <span className="has-cust-error">{validationError(errors,"phone")}</span> : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Email</label>
                                <input className={hasValidationError(errors,"email") ? "has-input-error" : ""} type="text" name="email" value={form.email} onChange={onChange} autoComplete="off"/>
                                {hasValidationError(errors,"email") ? <span className="has-cust-error">{validationError(errors,"email")}</span> : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="step-inner">
                    <div className="header-wrap mb15">
                        <div className="heading">
                            <span className="icon">2</span>
                            <span className="name">Billing Information</span>
                        </div>
                    </div>
                    <div className="step-body">
                        <div className='row-group'>
                            <div className="form-group">
                                <label className="label">Street</label>
                                <input className={hasValidationError(errors,"street") ? "has-input-error" : ""} type="text" name="street" value={form.street} onChange={onChange} autoComplete="off"/>
                                {hasValidationError(errors,"street") ? <span className="has-cust-error">{validationError(errors,"street")}</span> : null}
                            </div>
                            <div className="form-group">
                                <label className="label">City</label>
                                <input className={hasValidationError(errors,"city") ? "has-input-error" : ""} type="text" name="city" value={form.city} onChange={onChange} autoComplete="off"/>
                                {hasValidationError(errors,"city") ? <span className="has-cust-error">{validationError(errors,"city")}</span> : null}
                            </div>
                        </div>
                        <div className='row-group'>
                            <div className="form-group">
                                <label className="label">State</label>
                                <select name="state" className={hasValidationError(errors,"state") ? "has-input-error rt-cust-select" : "rt-cust-select"} onChange={onChange} value={form.state} autoComplete="off">
                                    <option value="">Select</option>
                                    {states.length > 0 ? states.map((state) => (
                                        <option key={state.id} value={state.name}>{state.name}</option>
                                    )) : null}
                                </select>
                                {hasValidationError(errors,"state") ? <span className="has-cust-error">{validationError(errors,"state")}</span> : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Zipcode</label>
                                <input className={hasValidationError(errors,"zip") ? "has-input-error" : ""} type="text" name="zip" value={form.zip} onChange={onChange} />
                                {hasValidationError(errors,"zip") ? <span className="has-cust-error">{validationError(errors,"zip")}</span> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="step step2">
                <div className="header-wrap">
                    <div className="heading">
                        <span className="icon">3</span>
                        <span className="name">Payment Information</span>
                    </div>
                </div>
                <div className="step-body">
                    <div className="form-group">
                        <label className="label">Card Holder Name</label>
                        <input className={hasValidationError(errors,"card_holder_name") ? "has-input-error custform-group" : "custform-group"} type="text" name="card_holder_name" onChange={onChange} value={form.card_holder_name}/>
                        {hasValidationError(errors,"card_holder_name") ? (<span className="has-cust-error">{validationError(errors,"card_holder_name")}</span>) : null}
                    </div>
                    <div className="form-group">
                        <label className="label">Card Number</label>
                        <div className={hasValidationError(errors,"cardNumber") ? "has-input-error custform-group" : "custform-group"}>
                            <CardNumberElement options={elementOptions} onChange={handleCardElementOnChange}/>
                        </div>
                        {hasValidationError(errors,"cardNumber") ? (<span className="has-cust-error">{validationError(errors,"cardNumber")}</span>) : null}
                    </div>
                    <div className='row-group'>
                        <div className="form-group">
                            <label className="label">Expiration</label>
                            <div className={hasValidationError(errors,"cardExpiry") ? "has-input-error custform-group" : "custform-group"}>
                                <CardExpiryElement options={elementOptions} onChange={handleCardElementOnChange}/>
                            </div>
                            {hasValidationError(errors,"cardExpiry") ? (<span className="has-cust-error">{validationError(errors,"cardExpiry")}</span>) : null}
                        </div>
                        <div className="form-group">
                            <label className="label">CVC</label>
                            <div className={hasValidationError(errors,"cardCvc") ? "has-input-error custform-group" : "custform-group"}>
                                <CardCvcElement options={elementOptions} onChange={handleCardElementOnChange}/>
                            </div>
                            {hasValidationError(errors,"cardCvc") ? (<span className="has-cust-error">{validationError(errors,"cardCvc")}</span>) : null}
                        </div>
                    </div>
                    <p className="description">This card will be charged on this day each {planType.type} as long as subscription is active.</p>
                </div>
            </div>
            <div className="step step3">
                <div className="header-wrap">
                    <div className="heading">
                        <span className="icon">4</span>
                        <span className="name">Review</span>
                    </div>
                </div>
                <div className="step-body">
                    <table>
                        <thead>
                            <tr>
                                <th>Plan Name</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{planType.name.replace("Profile",'')} Subscription</td>
                                <td>{priceFormat(planType.price)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bi-cart-total">
                        <div className="bi-cart-total-line">
                            <strong>Subtotal</strong>
                            <span>{priceFormat(planType.price)}</span>
                        </div>
                        <div className="bi-cart-total-line">
                            <strong>Discount</strong>
                            <span>0</span>
                        </div>
                        <div className="bi-cart-total-line">
                            <strong>Total</strong>
                            <span>{calculatedTotal()}</span>
                        </div>
                    </div>
                    <button className="bi-checkout-btn">Subscribe Now</button>
                </div>
            </div>
        </CheckoutWrap>
    )
}
export default CheckoutForm;