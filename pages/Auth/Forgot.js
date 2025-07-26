import React,{useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import FrontLayout from "@components/Layouts/Frontend";
import {API_STATUS,APP_NAME,BASE_URL,TOAST_OPTIONS,WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
import {hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
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
const ForgotPassword = () => {
    const [form,setForm] = useState({email:""});
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "email"){
            if(value == "" || (value && value.length <= 50)){
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
        const emailRE = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if(!form.email || !form.email.trim()){
            newError["email"] = "Required";
            positionFocus = positionFocus || "email";
        }else if(form.email && form.email.length > 50){
            newError["email"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "email";
        }else if(!emailRE.test(form.email)){
            newError["email"] = "Enter a valid email";
            positionFocus = positionFocus || "email";
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
            setSubmitting(true);
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(AUTH.FORGOT,form);
            if(data.status === API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                setForm({email: ""});
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
                <title>{`Forgot Password - ${APP_NAME}`}</title>
                <meta name="description" content="Forgot Password"/>
            </Head>
            <FrontLayout page="forgot">
                <Wrapper>
                    <div className="inner">
                        <form onSubmit={onSubmit} autoComplete="off" className="form">
                            <CustomHeading color={colors.BLACK} margin="0 0 30px" r767Margin="0 0 20px">Forgot Password</CustomHeading>
                            <div className="form-group">
                                <label className="label">Email address</label>
                                <input type="text" name="email" className={hasValidationError(errors,"email") ? "has-input-error" : ""} onChange={onChange} value={form.email} autoComplete="off"/>
                                {hasValidationError(errors,"email") ? (<span className="has-cust-error">{validationError(errors,"email")}</span>) : null}
                            </div>
                            <div className="submit-wrap">
                                <button type="submit" className="submit">Reset Password</button>
                            </div>
                            <div className="no-wrap">Back to  <a href={`${BASE_URL}/login`} className="link">Sign in</a></div>
                        </form>
                    </div>
                </Wrapper>
            </FrontLayout>
        </React.Fragment>
    );
}
export default ForgotPassword;