import React,{useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import Cookies from "js-cookie";
import FrontLayout from "@components/Layouts/Frontend";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL,ROLES,TOAST_OPTIONS,WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
import {eyeIcon,eyeCloseIcon} from "@helpers/Icons";
import {hasValidationError,validationError,focusOnFeild,checkRolesCode} from "@helpers/Frontend";
import axios from "@utils/axios";
import {AUTH} from "@constants/ApiConstant";
import {toast} from "react-toastify";
import CustomHeading from "@components/styled/Heading";
const Wrapper = styled.div`
   width:100%;display:flex;box-sizing:border-box;position:relative;background-size:cover;background-repeat:no-repeat;background-position:center;
    & .inner{
        width:${WIDTH};max-width:100%;padding:40px 20px;margin:0 auto;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
        & .form{
            width:600px;padding:40px;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;backdrop-filter:blur(8px);border:1px solid ${colors.BORDER};border-radius:8px;background:${colors.WHITE};
            & .bottom-wrap{
                display:flex;align-items:center;align-items:center;justify-content:space-between;column-gap:10px;
                & .remember{
                    display:flex;align-items:center;align-items:center;column-gap:8px;cursor:pointer;
                    & input{width:18px;height:18px;border:none;accent-color:${colors.RED};cursor:pointer;}
                    & span{color:${colors.BLACK};font-size:16px;font-weight:500;}
                }
                & .link{
                    color:${colors.BLACK};font-size:16px;font-weight:500;cursor:pointer;
                    &:hover{color:${colors.RED};}
                }
            }
            & .label,
            & input{color:${colors.BLACK};}
            & .submit-wrap{
                display:flex;align-items:center;justify-content:center;
                & .submit{
                    padding:0 30px;height:40px;color:${colors.WHITE};font-size:16px;font-weight:400;cursor:pointer;border:none;background:${colors.RED};border-radius:6px;margin-top:30px;transition:.2s;
                    &:hover{background:${colors.LIGHTGREEN};}
                }
            }
            & .no-wrap{
                font-size:16px;color:${colors.BLACK};display:flex;align-items:center;justify-content:center;column-gap:6px;margin-top:40px;
                & .link{
                    font-weight:600;cursor:pointer;color:${colors.RED};transition:.2s;
                    &:hover{color:${colors.RED};}
                }
            }
        }
    }
    @media(max-width:767px){
        & .inner{
            justify-content:center;
            & .banner{display:none;}
            & .form{
                padding:30px;
                .row-group{flex-direction:column;}
                & .no-wrap{margin-top:30px;}
            }
        }
    }
    @media(max-width:479px){
        & .inner{
            & .form{
                & .bottom-wrap{
                    & .remember{
                        column-gap:6px;
                        & input{width:15px;height:15px;}
                        & span{font-size:14px;font-weight:500;}
                    }
                    & .link{font-size:14px;font-weight:500;}
                }
                & .submit-wrap{
                    & .submit{padding:0 20px;height:35px;font-size:14px;}
                }
                & .no-wrap{
                    font-size:14px;column-gap:6px;
                    & .link{font-weight:500;}
                }
            }
        }
    }
`;
const Login = () => {
    const [form,setForm] = useState({email:"",password:"",remember_me:false});
    const [errors,setErrors] = useState([]);
    const [passwordVisible,setPasswordVisible] = useState(false);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "email"){
            if(value == "" || (value && value.length <= 50)){
                handleCustom(name,value);
            }
        }else if(name == "password" || name == "confirm_password"){
            if(value == "" || (value && value.length <= 30)){
                handleCustom(name,value);
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
        handleLoginSubmit();
    }
    const validate = () => {
        const newError = {};
        let positionFocus = "";
        const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!form.email || !form.email.trim()){
            newError["email"] = "Required";
            positionFocus = positionFocus || "email";
        }else if(form.email && form.email.length > 50){
            newError["email"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "email";
        }else if(!emailReg.test(form.email)){
            newError["email"] = "Enter a valid email address";
            positionFocus = positionFocus || "email";
        }
        if(!form.password || !form.password.trim()){
            newError["password"] = "Required";
            positionFocus = positionFocus || "password";
        }else if(form.password && form.password.length > 30){
            newError["password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "password";
        }
        setErrors(newError);
        if(positionFocus){
            focusOnFeild(positionFocus);
            return false;
        }
        return true;
    }
    const handleLoginSubmit = async() => {
        try{
            setSubmitting(true);
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(AUTH.LOGIN,form);
            if(data.status == API_STATUS.SUCCESS){
                const {user,token} = data;
                Cookies.set(`${APP_SLUG}-user`,JSON.stringify(user));
                Cookies.set(`${APP_SLUG}-token`,token);
                document.getElementById("custom-loader").style.display = "none";
                if(checkRolesCode(user.roles,ROLES.ADMIN.code)){
                    window.location = `${BASE_URL}/admin/dashboard`;
                }else if(checkRolesCode(user.roles,ROLES.USER.code)){
                    if(user.membership){
                        window.location = `${BASE_URL}/user/my-account`;
                    }else{
                        window.location = `${BASE_URL}/payment`;
                    }
                }
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
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`Login - ${APP_NAME}`}</title>
                <meta name="description" content="Login"/>
            </Head>
            <FrontLayout page="login">
                <Wrapper>
                    <div className="inner">
                        <form onSubmit={onSubmit} autoComplete="off" className="form">
                            <CustomHeading color={colors.BLACK} margin="0 0 30px" r767Margin="0 0 20px">Login</CustomHeading>
                            <div className="form-group">
                                <label className="label">Email address</label>
                                <input type="text" name="email" className={hasValidationError(errors,"email") ? "has-input-error" : ""} onChange={onChange} value={form.email} autoComplete="off"/>
                                {hasValidationError(errors,"email") ? (<span className="has-cust-error">{validationError(errors,"email")}</span>) : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Password</label>
                                <div className="password-wrap">
                                    <input className={hasValidationError(errors,"password") ? "has-input-error" : ""} type={passwordVisible ? "text" : "password"} name="password" onChange={onChange} value={form.password} autoComplete="off"/>
                                    <button type="button" className="vision" onClick={() => setPasswordVisible(!passwordVisible)}>
                                        {passwordVisible ? (
                                            eyeCloseIcon({width:20,height:20,fill:colors.TEXT})
                                        ) : (
                                            eyeIcon({width:20,height:20,fill:colors.TEXT})
                                        )}
                                    </button>
                                </div>
                                {hasValidationError(errors,"password") ? (<span className="has-cust-error">{validationError(errors,"password")}</span>) : null}
                            </div>
                            <div className="bottom-wrap">
                                <label className="remember">
                                    <input type="checkbox" name="remember_me" value="1"/>
                                    <span>Remember Me</span>
                                </label>
                                <a href={`${BASE_URL}/forgot`} className="link">Forgot Password?</a>
                            </div>
                            <div className="submit-wrap">
                                <button type="submit" className="submit">Log In</button>
                            </div>
                            <div className="no-wrap">
                                Don't have an account? <a href={`${BASE_URL}/register`} className="link">Register</a>
                            </div>
                        </form>
                    </div>
                </Wrapper>
            </FrontLayout>
        </React.Fragment>
    );
}
export default Login;