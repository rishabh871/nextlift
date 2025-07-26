import React,{useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import FrontLayout from "@components/Layouts/Frontend";
import {API_STATUS,APP_NAME,BASE_URL,TOAST_OPTIONS,WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
import {hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
import {AUTH} from "@constants/ApiConstant";
import axios from "@utils/axios";
import axiosApi from "axios";
import {toast} from "react-toastify";
import {eyeIcon,eyeCloseIcon} from "@helpers/Icons";
import CustomHeading from "@components/styled/Heading";
const Wrapper = styled.div`
    width:100%;display:flex;box-sizing:border-box;position:relative;background-size:cover;background-repeat:no-repeat;background-position:center;
    & .inner{
        width:${WIDTH};max-width:100%;padding:40px 20px;margin:0 auto;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
        & .form{
            width:600px;padding:40px;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;backdrop-filter:blur(8px);border:1px solid ${colors.BORDER};border-radius:8px;background:${colors.WHITE};
            & .submit-wrap{
                display:flex;align-items:center;justify-content:center;
                & .submit{
                    padding:0 30px;height:40px;color:${colors.WHITE};font-size:16px;font-weight:400;cursor:pointer;border:none;background:${colors.RED};border-radius:6px;margin-top:10px;transition:.2s;
                    &:hover{background:${colors.LIGHTGREEN};}
                }
            }
            & .label,
            & input{color:${colors.BLACK};}
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
const ResetPassword = ({token}) => {
    const [form,setForm] = useState({password:"",confirm_password:""});
    const [errors,setErrors] = useState([]);
    const [passwordVisible,setPasswordVisible] = useState(false);
    const [confirmPasswordVisible,setConfirmPasswordVisible] = useState(false);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "password" || name == "confirm_password"){
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
        handleSubmit();
    }
    const validate = () => {
        const newError = {};
        let positionFocus = "";
        const passRegix = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if(!form.password || !form.password.trim()){
            newError["password"] = "Required";
            positionFocus = positionFocus || "password";
        }else if(form.password && form.password.length > 30){
            newError["password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "password";
        }else if(form.password && !passRegix.test(form.password)){
            newError["password"] = "Password must have at least 8 character and contain at least one of each: uppercase letter, one lowercase letter, number, and symbol.";
            positionFocus = positionFocus || "password";
        }
        if(!form.confirm_password || !form.confirm_password.trim()){
            newError["confirm_password"] = "Required";
            positionFocus = positionFocus || "confirm_password";
        }else if(form.confirm_password && form.confirm_password.length > 30){
            newError["confirm_password"] = "Maximum 30 characters allowed";
            positionFocus = positionFocus || "confirm_password";
        }
        if(form.password && form.confirm_password && form.password != form.confirm_password){
            newError["confirm_password"] = "Password does not match.";
            positionFocus = positionFocus || "confirm_password";
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
            form["token"] = token;
            const {data} = await axios.post(AUTH.RESETPASSWORD,form);
            if(data.status === API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                setForm({password: "",confirm_password: ""});
                toast.success(data.message,TOAST_OPTIONS);
                setTimeout(() => {
                    window.location = `${BASE_URL}/login`;
                },500);
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
                <title>{`Reset Password - ${APP_NAME}`}</title>
                <meta name="description" content="Reset Password"/>
            </Head>
            <FrontLayout page="reset">
                <Wrapper>
                    <div className="inner">
                        <form onSubmit={onSubmit} autoComplete="off" className="form">
                            <CustomHeading color={colors.BLACK} margin="0 0 30px" r767Margin="0 0 20px">Reset Password</CustomHeading>
                            <div className="form-group">
                                <label className="label">New Password</label>
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
                            <div className="form-group">
                                <label className="label">Confirm Password</label>
                                <div className="password-wrap">
                                    <input className={hasValidationError(errors,"confirm_password") ? "has-input-error" : ""} type={confirmPasswordVisible ? "text" : "password"} name="confirm_password" onChange={onChange} value={form.confirm_password} autoComplete="off"/>
                                    <button type="button" className="vision" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                                        {confirmPasswordVisible ? (
                                            eyeCloseIcon({width:20,height:20,fill:colors.TEXT})
                                        ) : (
                                            eyeIcon({width:20,height:20,fill:colors.TEXT})
                                        )}
                                    </button>
                                </div>
                                {hasValidationError(errors,"confirm_password") ? (<span className="has-cust-error">{validationError(errors,"confirm_password")}</span>) : null}
                            </div>
                            <div className="submit-wrap">
                                <button type="submit" className="submit">Submit</button>
                            </div>
                            <div className="no-wrap">Back to <a href={`${BASE_URL}/login`} className="link">Sign in</a></div>
                        </form>
                    </div>
                </Wrapper>
            </FrontLayout>
        </React.Fragment>
    );
}
export async function getServerSideProps({req,res}){
    const {params} = req
    try{
        const {data} = await axiosApi.get(AUTH.RESETTOKEN,{params:{token: params.token}});
        if(data.status == API_STATUS.PRECONDITION_FAILED){
            res.writeHead(API_STATUS.MOVED_PERMANENTLY,{location:"/expired"});
            res.end();
            return;
        }
    }catch(e){
        if(e.response.status == API_STATUS.UNAUTHORIZED){
            res.writeHead(API_STATUS.MOVED_PERMANENTLY,{location:"/expired"});
            res.end();
            return;
        }
    }
    return {props: {token:params.token}}
}
export default ResetPassword;