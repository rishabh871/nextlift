import React,{useEffect,useState} from 'react';
import styled from "styled-components";
import axios from '@utils/axios';
import {toast} from 'react-toastify';
import {AUTH,PROFILE} from '@constants/ApiConstant';
import {API_STATUS,TOAST_OPTIONS} from '@constants/Common';
import colors from '@constants/Colors';
import {focusOnFeild,hasValidationError,validationError} from "@helpers/Frontend";
import {crossIcon} from "@helpers/Icons";
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
            padding:25px;display:flex;flex-direction:column;max-height:60vh;overflow:hidden;overflow-y:auto;font-size:14px;line-height:24px;color:#333;
            &::-webkit-scrollbar{width:6px;}
            &::-webkit-scrollbar-track{box-shadow:inset 0 0 6px #E2EFF6;}
            &::-webkit-scrollbar-thumb{background:#aaa;border-radius:10px;}
            &::-webkit-scrollbar-thumb:hover{background:#aaa;}
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
const ChangeAddressModel = ({customerAddress,modalAction,updateAddr}) => {
    const [submitting,setSubmitting] = useState(false);
    const [errors,setErrors] = useState([]);
    const [states,setStates] = useState([]);
    const [form,setForm] = useState({street: customerAddress.line1,city: customerAddress.city,state: customerAddress.state,zipcode: customerAddress.postal_code});
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
    const handleCustom = (name,value) => {
        setForm((prevState) => ({...prevState,[name]: value}));
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
        setErrors(newError);
        if(positionFocus){
            focusOnFeild(positionFocus);
            return false;
        }
        return true;
    }
    const handleSubmit = async() => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(PROFILE.CHANGE_BILLING_ADDRESS,form);
            if(data.status === API_STATUS.SUCCESS){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                setForm({street: '',city: '',state: '',zipcode: ''});
                updateAddr(data.customerAddress);
                modalAction(false);
                toast.success(data.message,TOAST_OPTIONS);
            }else if(data.status == 422){
                document.getElementById("custom-loader").style.display = "none";
                setSubmitting(false);
                setErrors(data.errors);
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
    }
    return (
        <MWrapper>
            <div className="back" onClick={() => modalAction(false)}></div>
            <div className="inner">
                <div className="header">
                    <span>Change Billing Address</span>
                    <button onClick={() => modalAction(false)} className="close">{crossIcon({width:18,height:18})}</button>
                </div>
                <div className="body">
                    <form onSubmit={onSubmit} autoComplete="off">
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
                                <button className="btn-apply" type="submit">Change</button>
                            ) : (
                                <button className="btn-apply" type="button">Loading ...</button>
                            )}
                            <button className="btn-clear" type="button" onClick={() => modalAction(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </MWrapper>
    );
}
export default ChangeAddressModel;