import React,{useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import axiosApi from "axios";
import {PROFILE} from "@constants/ApiConstant";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL,DEFAULT_IMAGE_URL,FILE_ACCEPTS,FILE_TYPES,ROLES,WIDTH,TOAST_OPTIONS} from "@constants/Common";
import axios from "@utils/axios";
import colors from "@constants/Colors";
import {handleUnauthorized,hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
import FrontImage from "@helpers/FrontImage";
import {toast} from "react-toastify";
const Wrapper = styled.div`
    box-sizing:border-box;
    & .inner-wrap{
        padding:30px;border-radius:6px;box-shadow:0px 3px 6px ${colors.SHADOW};display:flex;gap:25px;flex-direction:column;background:${colors.SECONDARY};
        & .heading{font-size:24px;line-height:28px;font-weight:600;color:${colors.WHITE};}
        & .inner{
            display:flex;column-gap:20px;
            & .profile-wrap{
                display:flex;flex-direction:column;gap:15px;
                & .rt-profile-logo{display:none;}
                & .image-wrap{
                    display:flex;border:1px solid ${colors.BORDER};border-radius:6px;position:relative;width:150px;height:150px;overflow:hidden;
                    & img{object-fit:cover;max-width:100%;max-height:100%;}
                }
                & .action-wrap{
                    display:flex;align-items:center;justify-content:center;gap:10px;
                    & .btn{
                        border:none;padding:8px 12px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;
                        &.btn-change{
                            background:${colors.GREEN};color:${colors.WHITE};
                        }
                        &.btn-delete{
                            background:${colors.RED};color:${colors.WHITE};
                        }
                    }
                }
            }
            & .form{
                flex:1;
                & .row-group{
                    flex-wrap:wrap;
                    & .form-group{
                        width:calc(25% - 15px);
                        &.full{width:100%;}
                        &.half{width:calc(50% - 10px);}
                        & .social-wrap-url{
                            display:flex;position:relative;
                            & span{display:flex;position:absolute;left:2px;top:2px;height:39px;font-size:14px;align-items:center;padding-left:15px;color:${colors.WHITE}}
                            & .input-width-facebook{padding-left:155px;text-transform:lowercase;}
                            & .input-width-twitter{padding-left:143px;text-transform:lowercase;}
                            & .input-width-linkedin{padding-left:148px;text-transform:lowercase;}
                            & .input-width-instagram{padding-left:160px;text-transform:lowercase;}
                        }
                    }
                }
                & .submit-wrap{
                    display:flex;
                    & .submit{font-size:16px;color:${colors.WHITE};background:${colors.RED};width:80px;height:40px;border:none;border-radius:6px;cursor:pointer;transition:.2s;}
                }
            }
        }
    }
    @media(max-width:991px){
        &.front{padding:30px 20px;}
        & .inner-wrap{
            & .inner{
               flex-direction:column;row-gap:20px;
               & .profile-wrap{
                    & .action-wrap{
                        justify-content:flex-start;gap:10px;
                    }
                }
            }
        }
    }
    @media(max-width:767px){
        &.front{padding:20px;}
        & .inner-wrap{
            padding:20px;gap:15px;
            & .heading{font-size:20px;}
            & .inner{
                & .form{
                    & .row-group{
                        gap:10px;
                        & .form-group{
                            width:calc(50% - 5px);
                            &.half{width:calc(50% - 5px);}
                        }   
                    }
                    & .submit-wrap{
                        & .submit{font-size:14px;width:75px;height:38px;}
                    }
                }   
            }
        }
    }
    @media(max-width:648px){
        & .inner-wrap{
            & .inner{
                & .form{
                    & .row-group{
                        & .form-group{
                            width:calc(100%);
                            &.half{width:calc(100%);}
                        }   
                    }   
                }   
            }
        }
    }
`;
const Profile = ({profileData}) => {
    const [form,setForm] = useState(profileData);
    const [updateProfile,setUpdateProfile] = useState(false);
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "phone"){
            let newValue = value.replace(/[^0-9]/gi,"");
            if(newValue == "" || (newValue && newValue >= 1 && newValue.length <= 10)){
                handleCustom(name,newValue);
            }
        }else if(name == "first_name" || name == "last_name"){
            if(value == "" || (value && value.length <= 30)){
                handleCustom(name,value);
            }
        }else if(name == "slogan" || name == "address"){
            if(value == "" || (value && value.length <= 255)){
                handleCustom(name,value);
            }
        }else if(name == "facebook" || name == "twitter" || name == "linkedin" || name == "instagram"){
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
        const phoneReg = /[6-9]{1}\d{9}/;
        if(!form.first_name || !form.first_name.trim()){
            newError["first_name"] = "Required";
            positionFocus = positionFocus || "first_name";
        }
        if(!form.last_name || !form.last_name.trim()){
            newError["last_name"] = "Required";
            positionFocus = positionFocus || "last_name";
        }
        if(!form.phone){
            newError["phone"] = "Required";
            positionFocus = positionFocus || "phone";
        }else if(!phoneReg.test(form.phone)){
            newError["phone"] = "Enter a valid phone number";
            positionFocus = positionFocus || "phone";
        }
        if(form.slogan && form.slogan.length > 255){
            newError["slogan"] = "Maximum 255 characters allowed";
            positionFocus = positionFocus || "slogan";
        }
        if(form.address && form.address.length > 255){
            newError["address"] = "Maximum 255 characters allowed";
            positionFocus = positionFocus || "address";
        }
        if(form.facebook && form.facebook.length > 50){
            newError["facebook"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "facebook";
        }
        if(form.twitter && form.twitter.length > 50){
            newError["twitter"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "twitter";
        }
        if(form.linkedin && form.linkedin.length > 50){
            newError["linkedin"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "linkedin";
        }
        if(form.instagram && form.instagram.length > 50){
            newError["instagram"] = "Maximum 50 characters allowed";
            positionFocus = positionFocus || "instagram";
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
            var formData = new FormData();
            for(var key in form){
                formData.append(key,form[key] ? form[key] : "");
            }
            setSubmitting(true);
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(PROFILE.VIEW,formData);
            if(data.status == API_STATUS.SUCCESS){
                setSubmitting(false);
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
            }
        }catch(e){
            let errObj = e.response;
            setSubmitting(false);
            document.getElementById("custom-loader").style.display = "none";
            if(errObj){
                if(errObj.data.status == API_STATUS.UNPROCESSABLE_ENTITY){
                    setErrors(errObj.data.errors);
                }else if(errObj.data.message){
                    toast.error(errObj.data.message,TOAST_OPTIONS);
                }
            }
        }
    }
    const handleUploadPhoto = (element) => {
        document.querySelector(element).value = "";
        document.querySelector(element).click();
    }
    const handleSelectPhoto = (files) => {
        if(!files.length){
            setErrors((prevState) => ({errors: {...prevState.errors,picture: "Invalid format"}}));
            return;
        }
        let type = files[0].type.split("/")[0];
        let ext = files[0].type.split("/")[1];
        if(type === "image" && FILE_TYPES.IMAGES.includes(ext)){
            if(form.picture){
                handleCustom("deletePhoto","1");
            }
            handleCustom("picture",files[0]);
            setUpdateProfile(true);
            setErrors((prevState) => ({errors: {...prevState.errors,picture: ""}}));
        }else{
            setErrors((prevState) => ({errors: {...prevState.errors,picture: "Invalid format"}}));
        }
    }
    const handleDeletePhoto = () => {
        handleCustom("picture","");
        handleCustom("deletePhoto","1");
        setUpdateProfile(false);
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`Profile - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="profile">
                <Wrapper>
                    <div className="inner-wrap">
                        <div className="heading">My Profile</div>
                        <div className="inner">
                            <div className="profile-wrap">
                                <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-profile-logo" onChange={(e) => handleSelectPhoto(e.target.files)} />
                                <div className="image-wrap">
                                    {updateProfile && form.picture ? (
                                        <img src={form.picture ? URL.createObjectURL(form.picture) : DEFAULT_IMAGE_URL} />
                                    ) : (
                                        <FrontImage src={(form.picture && typeof form.picture === "string") ? form.picture : DEFAULT_IMAGE_URL} alt="Profile Image" layout="fill" objectFit="cover" fill/>
                                    )}
                                </div>
                                <div className="action-wrap">
                                    <button type="button" className="btn btn-change" onClick={() => handleUploadPhoto('.rt-profile-logo')}>{form.picture ? 'Change' : 'Add'}</button>
                                    {form.picture && (
                                        <button type="button" className="btn btn-delete" onClick={handleDeletePhoto}>Delete</button>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={onSubmit} autoComplete="off" className="form">
                                <div className="row-group">
                                    <div className="form-group">
                                        <label className="label">First Name</label>
                                        <input type="text" className={hasValidationError(errors,"first_name") ? "has-input-error" : ""} name="first_name" value={form.first_name} onChange={onChange} autoComplete="off"/>
                                        {hasValidationError(errors,"first_name") ? <span className="has-cust-error">{validationError(errors,"first_name")}</span> : null}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Last Name</label>
                                        <input type="text" className={hasValidationError(errors,"last_name") ? "has-input-error" : ""} name="last_name" value={form.last_name} onChange={onChange} autoComplete="off"/>
                                        {hasValidationError(errors,"last_name") ? <span className="has-cust-error">{validationError(errors,"last_name")}</span> : null}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Email</label>
                                        <input type="text" name="email" value={form.email} disabled autoComplete="off"/>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Phone</label>
                                        <input type="text" className={hasValidationError(errors,"phone") ? "has-input-error" : ""} name="phone" value={form.phone} onChange={onChange} autoComplete="off"/>
                                        {hasValidationError(errors,"phone") ? (<span className="has-cust-error">{validationError(errors,"phone")}</span>) : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Slogan</label>
                                        <input type="text" className={hasValidationError(errors,"slogan") ? "has-input-error" : ""} name="slogan" value={form.slogan} onChange={onChange} autoComplete="off"/>
                                        {hasValidationError(errors,"slogan") ? <span className="has-cust-error">{validationError(errors,"slogan")}</span> : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Address</label>
                                        <input type="text" className={hasValidationError(errors,"address") ? "has-input-error" : ""} name="address" value={form.address} onChange={onChange} autoComplete="off"/>
                                        {hasValidationError(errors,"address") ? <span className="has-cust-error">{validationError(errors,"address")}</span> : null}
                                    </div>
                                    <div className="form-group full">
                                        <label className="label">Bio</label>
                                        <textarea type="text" className={hasValidationError(errors,"bio") ? "has-input-error" : ""} name="bio" value={form.bio} onChange={onChange} autoComplete="off"></textarea>
                                        {hasValidationError(errors,"bio") ? <span className="has-cust-error">{validationError(errors,"bio")}</span> : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Facebook</label>
                                        <div className="social-wrap-url">
                                            <span>https://facebook.com/</span>
                                            <input type="text" className={hasValidationError(errors,"facebook") ? "input-width-facebook has-input-error" : "input-width-facebook"} name="facebook" value={form.facebook} onChange={onChange} autoComplete="off" placeholder="username"/>
                                        </div>
                                        {hasValidationError(errors,"facebook") ? <span className="has-cust-error">{validationError(errors,"facebook")}</span> : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Twitter</label>
                                        <div className="social-wrap-url">
                                            <span>https://twitter.com/</span>
                                            <input type="text" className={hasValidationError(errors,"twitter") ? "input-width-twitter has-input-error" : "input-width-twitter"} name="twitter" value={form.twitter} onChange={onChange} autoComplete="off" placeholder="username"/>
                                        </div>
                                        {hasValidationError(errors,"twitter") ? <span className="has-cust-error">{validationError(errors,"twitter")}</span> : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Linkedin</label>
                                        <div className="social-wrap-url">
                                            <span>https://linkedin.com/</span>
                                            <input type="text" className={hasValidationError(errors,"linkedin") ? "input-width-linkedin has-input-error" : "input-width-linkedin"} name="linkedin" value={form.linkedin} onChange={onChange} autoComplete="off" placeholder="username"/>
                                        </div>
                                        {hasValidationError(errors,"linkedin") ? <span className="has-cust-error">{validationError(errors,"linkedin")}</span> : null}
                                    </div>
                                    <div className="form-group half">
                                        <label className="label">Instagram</label>
                                        <div className="social-wrap-url">
                                            <span>https://instagram.com/</span>
                                            <input type="text" className={hasValidationError(errors,"instagram") ? "input-width-instagram has-input-error" : "input-width-instagram"} name="instagram" value={form.instagram} onChange={onChange} autoComplete="off" placeholder="username"/>
                                        </div>
                                        {hasValidationError(errors,"instagram") ? <span className="has-cust-error">{validationError(errors,"instagram")}</span> : null}
                                    </div>
                                </div>
                                <div className="submit-wrap">
                                    <button type="submit" className="submit">Submit</button>
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
        if(currentUrl != "/admin/profile"){
            context.res.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/admin/profile`});
            context.res.end();
            return {props: {}};
        }
    }else if(user && user.roles.includes(ROLES.USER.code)){
        if(currentUrl != "/user/profile"){
            context.res.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/user/profile`});
            context.res.end();
            return {props: {}};
        }
    }
    let profileData = {picture:"",first_name:"",last_name:"",email:"",phone:"",slogan:"",address:"",bio:"",facebook:"",twitter:"",linkedin:"",instagram:""};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(PROFILE.VIEW,{headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            profileData = data.user;
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{profileData},"PROFILE:VIEW",{isMembership:true});
}
export default Profile;