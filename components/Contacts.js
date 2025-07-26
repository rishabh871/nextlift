import React,{useState} from "react";
import styled from "styled-components";
import colors from "@constants/Colors";
import {toast} from "react-toastify";
import {API_STATUS,TOAST_OPTIONS,WIDTH} from "@constants/Common";
import {facebookIcon} from "@helpers/Icons";
import {hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
const Wrapper = styled.div`
    width:100%;max-width:100%;box-sizing:border-box;display:flex;flex-direction:column;
    & .contacts-wrap{
        display:flex;flex-wrap:wrap;box-sizing:border-box;gap:40px;width:${WIDTH};max-width:100%;margin:0 auto;padding:60px 20px;
        & .contact-form-wrap{
            flex:1;box-sizing:border-box;
            & .heading{font-size:24px;font-weight:600;margin-bottom:10px;color:${colors.BLACK};}
            & .sub-heading{font-size:16px;margin-bottom:20px;color:${colors.BLACK};}
            & form{
                & .label{color:${colors.BLACK};}
                & input{color:${colors.BLACK};}
                & textarea{color:${colors.BLACK};}
                & .btn-submit{
                    font-size:16px;height:36px;color:${colors.WHITE};background:${colors.GREEN};display:flex;align-items:center;padding:0 15px;border-radius:6px;cursor:pointer;border:none;
                    &:hover{background:${colors.RED};}
                }
            }
        }
        & .contact-info{
            width:250px;
            & .item{
                padding-bottom:25px;border-bottom:1px solid ${colors.BORDER};margin-bottom:15px;
                & .heading{font-size:20px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                & .link{
                    font-size:16px;color:${colors.BLACK};cursor:pointer;
                    &:hover{color:${colors.RED};}
                }
            }
            & .social-wrap{
                & .heading{font-size:20px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                & .social-inner{
                    display:flex;gap:8px;
                    & .social-link{display:flex;align-items:center;justify-content:center;width:35px;height:35px;border-radius:4px;background:${colors.GREEN};transition:0.2s;}
                }
            }
        }
    }
    & .map-wrap{
        width:100%;max-width:100%;box-sizing:border-box;display:flex;flex-direction:column;
        & iframe{width:100%;height:450px;}
    }
    @media (max-width:991px){
        & .contacts-wrap{padding:40px 20px;gap:30px;}
    }
    @media (max-width:767px){
        & .contacts-wrap{
            padding:30px 20px;
            flex-direction:column;
            & .contact-form-wrap,
            & .contact-info{width:100%;}
        }
    }
`;
const Contacts = ({page}) => {
    const [form,setForm] = useState({first_name: "",last_name: "",email: "",phone: "",message: ""});
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
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
        const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!form.first_name || !form.first_name.trim()){
            newError["first_name"] = "Required";
            positionFocus = positionFocus || "first_name";
        }
        if(!form.last_name || !form.last_name.trim()){
            newError["last_name"] = "Required";
            positionFocus = positionFocus || "last_name";
        }
        if(!form.email || !form.email.trim()){
            newError["email"] = "Required";
            positionFocus = positionFocus || "email";
        }else if(!emailRE.test(form.email)){
            newError["email"] = "Enter a valid email";
            positionFocus = positionFocus || "email";
        }
        if(!form.phone || !form.phone.trim()){
            newError["phone"] = "Required";
            positionFocus = positionFocus || "phone";
        }
        if(!form.message || !form.message.trim()){
            newError["message"] = "Required";
            positionFocus = positionFocus || "message";
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
            const {data} = await axios.post(MASTER.contacts,form);
            if(data.status == API_STATUS.SUCCESS){
                setForm({first_name:"",last_name:"",email:"",phone:"",message:""});
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                setSubmitting(false);
            }else if(data.status == 422){
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
        }
    }
    return (
        <Wrapper>
            <div className="contacts-wrap">
                <div className="contact-form-wrap">
                    <div className="heading">Get in Touch With Us</div>
                    <div className="sub-heading">World’s leading non-asset- based supply chain management companies, we design and implement industry-leading. We specialise in intelligent & effective search and believes business.</div>
                    <form onSubmit={onSubmit} autoComplete="off">
                        <div className="row-group">
                            <div className="form-group">
                                <label className="label">First Name</label>
                                <input className={hasValidationError(errors,"first_name") ? "has-input-error" : ""} type="text" name="first_name" onChange={onChange} value={form.first_name} autoComplete="off"/>
                                {hasValidationError(errors,"first_name") ? (<span className="has-cust-error">{validationError(errors,"first_name")}</span>) : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Last Name</label>
                                <input className={hasValidationError(errors,"last_name") ? "has-input-error" : ""} type="text" name="last_name" onChange={onChange} value={form.last_name} autoComplete="off"/>
                                {hasValidationError(errors,"last_name") ? (<span className="has-cust-error">{validationError(errors,"last_name")}</span>) : null}
                            </div>
                        </div>
                        <div className="row-group">
                            <div className="form-group">
                                <label className="label">Email Address</label>
                                <input className={hasValidationError(errors,"email") ? "has-input-error" : ""} type="text" name="email" onChange={onChange} value={form.email} autoComplete="off"/>
                                {hasValidationError(errors,"email") ? (<span className="has-cust-error">{validationError(errors,"email")}</span>) : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Phone Number</label>
                                <input className={hasValidationError(errors,"phone") ? "has-input-error" : ""} type="text" name="phone" onChange={onChange} value={form.phone} autoComplete="off"/>
                                {hasValidationError(errors,"phone") ? (<span className="has-cust-error">{validationError(errors,"phone")}</span>) : null}
                            </div>
                        </div>                         
                        <div className="row-group">
                            <div className="form-group">
                                <label className="label">Message</label>
                                <textarea className={hasValidationError(errors,"message") ? "has-input-error" : ""} name="message" onChange={onChange} value={form.message} autoComplete="off"></textarea>
                                {hasValidationError(errors,"message") ? (<span className="has-cust-error">{validationError(errors,"message")}</span>) : null}
                            </div>
                        </div>
                        <div className="row-group">
                            <button className="btn-submit">Submit</button>
                        </div>
                    </form>
                </div>
                <div className="contact-info">
                    {page.contact_phone ? (
                        <div className="item">
                            <div className="heading">Call us</div>
                            <a href={`tel:${page.contact_phone}`} className="link">{page.contact_phone}</a>
                        </div>
                    ) : null}
                    {page.contact_email ? (
                        <div className="item">
                            <div className="heading">Email</div>
                            <a href={`mailto:${page.contact_email}`} className="link">{page.contact_email}</a>
                        </div>
                    ) : null}
                    {page.contact_address ? (
                        <div className="item">
                            <div className="heading">Address</div>
                            <div className="link">{page.contact_address}</div>
                        </div>
                    ) : null}
                    <div className="social-wrap">
                        <div className="heading">Social Media</div>
                        <div className="social-inner">
                            <a href="https://www.facebook.com/people/Next-Lift/61570158555210" target="_blank" className="social-link">{facebookIcon({width:18,height:18,fill:colors.WHITE})}</a>
                        </div>
                    </div>
                </div>
            </div>
            {(page.contact_is_map_visible && page.contact_map_url) ? (
                <div className="map-wrap">
                    <iframe src={page.contact_map_url} style={{border:0}} loading="lazy" allowFullScreen></iframe>
                </div>
            ) : null}
        </Wrapper>
    );
}
export default Contacts;