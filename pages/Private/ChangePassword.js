import React,{useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import {toast} from "react-toastify";
import FrontLayout from "@components/Layouts/Frontend";
import BackendLayout from "@components/Layouts/Backend";
import {getServerProps} from "@utils/authUtils";
import {APP_NAME,API_STATUS,APP_SLUG,BASE_URL,ROLES,TOAST_OPTIONS,WIDTH} from "@constants/Common";
import {checkRolesCode,hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
import colors from "@constants/Colors";
import {eyeIcon,eyeCloseIcon} from "@helpers/Icons";
import {PROFILE} from "@constants/ApiConstant";
import axios from "@utils/axios";
const Wrapper = styled.div`
    box-sizing:border-box;
    &.front{min-height:calc(100vh - 135px);margin:auto;width:100%;max-width:${WIDTH};padding:60px 20px;}
    & .inner{
        background:${colors.SECONDARY};padding:30px;border-radius:6px;box-shadow:0px 3px 6px ${colors.SHADOW};width:100%;box-sizing:border-box;
        & .heading{font-size:24px;line-height:28px;font-weight:600;color:${colors.WHITE};margin:0 0 20px;}
        & .inner-box{
            display:flex;column-gap:40px;max-width:900px;margin:0 auto;
            & .content-wrap{
                width:40%;padding-top:30px;
                & .sub-heading{font-size:16px;line-height:28px;color:${colors.WHITE};}
                & .lists{
                    padding:0 0 0 20px;margin:0;
                    & .list{font-size:16px;line-height:28px;color:${colors.WHITE};}
                }
            }
            & .form{
                width:60%;
                & .submit-wrap{
                    display:flex;align-items:center;justify-content:flex-end;column-gap:10px;
                    & .btn{
                        display:flex;align-items:center;justify-content:center;margin:0;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:6px;font-weight:500;cursor:pointer;
                        &.cancel{background:${colors.CANCEL};}
                    }
                }
            }
        }
    }
    @media(max-width:991px){
        & .inner{
            padding:30px;
            & .heading{font-size:24px;line-height:28px;margin:0 0 20px;}
            & .inner-box{
                display:flex;column-gap:20px;
            }
        }
    }
    @media(max-width:767px){
        &.front{padding:20px;}
        & .inner{
            padding:20px;
            & .heading{font-size:20px;margin:0 0 10px;}
            & .inner-box{
               flex-direction:column;row-gap:20px;
               & .content-wrap{
                    width:100%;padding:0;
                    & .sub-heading{font-size:14px;}
                    & .lists{
                        & .list{font-size:14px;line-height:24px;}
                    }
                }
                & .form{
                    width:100%;
                    & .submit-wrap{
                        & .btn{font-size:14px;height:38px;padding:0 10px;}
                    }
                }
            }
        }
    }
`;
const ChangePassword = () => {
    const [form,setForm] = useState({old_password:"",password:"",confirm_password:""});
    const [errors,setErrors] = useState([]);
    const [passwordVisible,setPasswordVisible] = useState(false);
    const [oldPasswordVisible,setOldPasswordVisible] = useState(false);
    const [confirmPasswordVisible,setConfirmPasswordVisible] = useState(false);
    const [submitting,setSubmitting] = useState(false)
    const handleCancel = () => {
        setForm({old_password:"",password:"",confirm_password:""});
        setErrors([]);
    }
    const onChange = (e) => {
        const {name,value} = e.target;
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
        const passRegix = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if(!form.old_password || !form.old_password.trim()){
            newError["old_password"] = "Required";
            positionFocus = positionFocus || "old_password";
        }else if(form.old_password && form.old_password.length > 30){
            newError["old_password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "old_password";
        }
        if(!form.password || !form.password.trim()){
            newError["password"] = "Required";
            positionFocus = positionFocus || "password";
        }else if(form.password && form.password.length > 30){
            newError["password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "password";
        }
        if(!form.confirm_password || !form.confirm_password.trim()){
            newError["confirm_password"] = "Required";
            positionFocus = positionFocus || "confirm_password";
        }else if(form.confirm_password && form.confirm_password.length > 30){
            newError["confirm_password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "confirm_password";
        }
        if(form.old_password && form.password){
            if(form.old_password == form.password){
                newError["password"] = "Old and New Password should not be same.";
                positionFocus = positionFocus || "password";
            }else if(form.password && form.password.length > 30){
                newError["password"] = "Maximum 30 characters allowed";
                positionFocus = positionFocus || "password";
            }else if(!passRegix.test(form.password)){
                newError["password"] = "Password must have at least 8 character and contain at least one of each: uppercase letter, one lowercase letter, number, and symbol.";
                positionFocus = positionFocus || "password";
            }else if(form.confirm_password && form.password != form.confirm_password){
                newError["confirm_password"] = "Password does not match.";
                positionFocus = positionFocus || "confirm_password";
            }
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
            const {data} = await axios.post(PROFILE.CHANGEPASSWORD,form);
            if(data.status === API_STATUS.SUCCESS){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                setForm({old_password:"",password:"",confirm_password:""});
                toast.success(data.message,TOAST_OPTIONS);
            }else if(data.status == API_STATUS.UNPROCESSABLE_ENTITY){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                setErrors(data.errors)
            }
        }catch(e){
            setSubmitting(false);
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`Change Password - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="change-password">
                <Wrapper>
                    <div className="inner">
                        <div className="heading">Change Password</div>
                        <div className="inner-box">
                            <div className="content-wrap">
                                <div className="sub-heading">Password must contain:</div>
                                <ul className="lists">
                                    <li className="list">At least 8 characters</li>
                                    <li className="list">At least 1 upper case letter (A-Z)</li>
                                    <li className="list">At least 1 lower case letter (a-z)</li>
                                    <li className="list">At least 1 number (0-9)</li>
                                    <li className="list">At least 1 special characters</li>
                                </ul>
                            </div>
                            <form onSubmit={onSubmit} autoComplete="off" className="form">
                                <div className="form-group">
                                    <label className="label">Old Password</label>
                                    <div className="password-wrap">
                                        <input className={hasValidationError(errors,"old_password") ? "has-input-error" : ""} type={oldPasswordVisible ? "text" : "password"} name="old_password" onChange={onChange} value={form.old_password} autoComplete="off"/>
                                        <button type="button" onClick={() => setOldPasswordVisible(!oldPasswordVisible)} className="visibility">
                                            {oldPasswordVisible ? (
                                                eyeIcon({width:18,height:18,fill:colors.WHITE})
                                            ) : (
                                                eyeCloseIcon({width:18,height:18,fill:colors.WHITE})
                                            )}
                                        </button>
                                    </div>
                                    {hasValidationError(errors,"old_password") ? (<span className="has-cust-error">{validationError(errors,"old_password")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">New Password</label>
                                    <div className="password-wrap">
                                        <input className={hasValidationError(errors,"password") ? "has-input-error" : ""} type={passwordVisible ? "text" : "password"} name="password" onChange={onChange} value={form.password} autoComplete="off"/>
                                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="visibility">
                                            {passwordVisible ? (
                                                eyeIcon({width:18,height:18,fill:colors.WHITE})
                                            ) : (
                                                eyeCloseIcon({width:18,height:18,fill:colors.WHITE})
                                            )}
                                        </button>
                                    </div>
                                    {hasValidationError(errors,"password") ? (<span className="has-cust-error">{validationError(errors,"password")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Confirm Password</label>
                                    <div className="password-wrap">
                                        <input className={hasValidationError(errors,"confirm_password") ? "has-input-error" : ""} type={confirmPasswordVisible ? "text" : "password"} name="confirm_password" onChange={onChange} value={form.confirm_password} autoComplete="off"/>
                                        <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="visibility">
                                            {confirmPasswordVisible ? (
                                                eyeIcon({width:18,height:18,fill:colors.WHITE})
                                            ) : (
                                                eyeCloseIcon({width:18,height:18,fill:colors.WHITE})
                                            )}
                                        </button>
                                    </div>
                                    {hasValidationError(errors,"confirm_password") ? (<span className="has-cust-error">{validationError(errors,"confirm_password")}</span>) : null}
                                </div>
                                <div className="submit-wrap">
                                    <button onClick={handleCancel} type="button" className="btn cancel">Cancel</button>
                                    <button type="submit" className="btn">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    const currentUrl = context.req.url;
    let user = context.req.cookies[`${APP_SLUG}-user`] ? JSON.parse(context.req.cookies[`${APP_SLUG}-user`]) : null;
    if(user && user.roles.includes(ROLES.ADMIN.code)){
        if(currentUrl != "/admin/change-password"){
            context.res.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/admin/change-password`});
            context.res.end();
            return {props: {}};
        }
    }else if(user && user.roles.includes(ROLES.USER.code)){
        if(currentUrl != "/user/change-password"){
            context.res.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/user/change-password`});
            context.res.end();
            return {props: {}};
        }
    }
    return getServerProps(context,{},"CHANGEPASSWORD:VIEW",{isMembership:true});
}
export default ChangePassword;