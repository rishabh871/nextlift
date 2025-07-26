import React,{useState} from "react";
import styled from "styled-components";
import axios from "@utils/axios";
import {toast} from "react-toastify";
import {API_STATUS,BASE_URL,DEFAULT_IMAGE_URL,FILE_ACCEPTS,FILE_TYPES,TOAST_OPTIONS} from "@constants/Common";
import {MEMBERSHIPS} from "@constants/ApiConstant";
import {hasValidationError,validationError,focusOnFeild,cleanHtml} from "@helpers/Frontend";
import FrontImage from "@helpers/FrontImage";
import colors from "@constants/Colors";
import SwitchButton from "@components/SwitchButton";
import TextEditor from "@helpers/TextEditor";
import {crossIcon} from "@helpers/Icons";
const MembershipWrapper = styled.form`
    & .profile-wrap{
        display:flex;flex-direction:column;gap:15px;align-items:flex-start;margin-bottom:20px;
        & .rt-cust-banner{display:none;}
        & .image-wrap{
            display:flex;border:1px solid ${colors.BORDER};border-radius:6px;position:relative;width:100%;height:200px;max-width:400px;overflow:hidden;cursor:pointer;
            & img{object-fit:cover;max-width:100%;max-height:100%;width:100%;}
            & .btn-delete{background:${colors.RED};cursor:pointer;border:none;position:absolute;right:8px;top:8px;width:30px;height:30px;margin:0;padding:0;border-radius:30px;}
        }
        & .action-wrap{
            display:flex;align-items:center;justify-content:center;gap:10px;
            & .btn{
                border:none;padding:8px 12px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;
                &.btn-change{
                    background:${colors.GREEN};color:${colors.WHITE};
                }
                
            }
        }
    }
    & .submit-wrap{
        display:flex;align-items:center;column-gap:10px;
        & .btn{
            display:flex;align-items:center;justify-content:center;margin:0;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:6px;font-weight:500;cursor:pointer;
            &.cancel{background:${colors.CANCEL};}
        }
    }
`;
const AddEditMembership = ({membershipData}) => {
    const [form,setForm] = useState(membershipData);
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "price"){
            let newValue = value.replace(/[^0-9.]/gi,"");
            if(newValue == "00"){
                newValue = "0";
            }
            newValue = (newValue.indexOf(".") >= 0) ? (newValue.substr(0,newValue.indexOf(".")) + newValue.substr(newValue.indexOf("."),3)) : newValue;
            if(newValue == "" || (newValue >= 0 && newValue <= 999999)){
                handleCustom(name,newValue);
            }
        }else if(name == "position"){
            let newValue = value.replace(/[^0-9]/gi,"");
            if(newValue == "00"){
                newValue = "0";
            }
            if(newValue == "" || (newValue >= 0 && newValue <= 999999)){
                handleCustom(name,newValue);
            }
        }else{
            handleCustom(name,value);
        }
    }
    const handleCustom = (name,value) => {
        setForm((prevState) => ({...prevState,[name]: value}));
    }
    const handleChangeIsFree = () => {
        let isisFree = (form.is_free ? false : true);
        handleCustom("is_free",isisFree);
        handleCustom("stripe_product_id","");
        handleCustom("stripe_price_id","");
        handleCustom("price","");
        handleCustom("type","");
    }
    const changeUploadFile = (element) => {
        document.querySelector(element).value = "";
        document.querySelector(element).click();
    }
    const handleImageChange = (files,key) => {
        if(!files.length){
            setErrors((prevState) => ({errors: {...prevState.errors,[key]: "Invalid format"}}));
            return;
        }
        let type = files[0].type.split("/")[0];
        let ext = files[0].type.split("/")[1];
        if(type === "image" && FILE_TYPES.IMAGES.includes(ext)){
            handleCustom(key,files[0]);
            setErrors((prevState) => ({errors: {...prevState.errors,[key]: ""}}));
        }else{
            setErrors((prevState) => ({errors: {...prevState.errors,[key]: "Invalid format"}}));
        }
    }
    const handleDeleteBanner = () => {
        handleCustom("banner","");
        handleCustom("deleteBanner","1");
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
        if(!form.name || !form.name.trim()){
            newError["name"] = "Required";
            positionFocus = positionFocus || "name";
        }else if(form.name && form.name.length > 100){
            newError["name"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "name";
        }
        if(!form.position){
            newError["position"] = "Required";
            positionFocus = positionFocus || "position";
        }
        if(!form.is_free){
            if(!form.price){
                newError["price"] = "Required";
                positionFocus = positionFocus || "price";
            }
            if(!form.type || !form.type.trim()){
                newError["type"] = "Required";
                positionFocus = positionFocus || "type";
            }
            if(!form.stripe_product_id || !form.stripe_product_id.trim()){
                newError["stripe_product_id"] = "Required";
                positionFocus = positionFocus || "stripe_product_id";
            }
            if(!form.stripe_price_id || !form.stripe_price_id.trim()){
                newError["stripe_price_id"] = "Required";
                positionFocus = positionFocus || "stripe_price_id";
            }
        }
        if(!form.description || !form.description.trim()){
            newError["description"] = "Required";
            positionFocus = positionFocus || "description";
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
            var formData = new FormData();
            for(var key in form){
                if(key == "description"){
                    let formDescription = cleanHtml(form.description);
                    formData.append("description",formDescription);
                }else if(key == "banner" && form.banner){
                    formData.append("banner",form.banner);
                }else{
                    formData.append(key,form[key] ? form[key] : "");
                } 
            }
            const {data} = await axios.post(MEMBERSHIPS.ADDUPDATE,formData);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                setTimeout(() => {
                    window.location = `${BASE_URL}/admin/memberships`;
                },500);
            }else if(data.status == API_STATUS.UNPROCESSABLE_ENTITY){
                document.getElementById("custom-loader").style.display = "none";
                setSubmitting(false);
                setErrors(data.errors);
            }else{
                document.getElementById("custom-loader").style.display = "none";
                setSubmitting(false);
                toast.error(data.message,TOAST_OPTIONS);
            }
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            setSubmitting(false);
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    return (
        <MembershipWrapper onSubmit={onSubmit} autoComplete="off">
            <div className="profile-wrap">
                <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-cust-banner" onChange={(e) => handleImageChange(e.target.files,'banner')}/>
                <div className="image-wrap">
                    {(form.banner && typeof form.banner === "object") ? (
                        <FrontImage onClick={() => changeUploadFile('.rt-cust-banner')} src={URL.createObjectURL(form.banner)} alt="Banner Image" layout="fill" objectFit="cover" fill/>
                    ) : (
                        <FrontImage onClick={() => changeUploadFile('.rt-cust-banner')} src={(form.banner && typeof form.banner === "string") ? form.banner : DEFAULT_IMAGE_URL} alt="Banner Image" layout="fill" objectFit="cover" fill/>
                    )}
                    {form.banner && (
                        <button type="button" className="btn btn-delete" onClick={handleDeleteBanner}>{crossIcon({width:16,height:16,fill:colors.WHITE})}</button>
                    )}
                </div>
            </div>
            <div className="row-group">
                <div className="form-group">
                    <label className="label">Membership Name</label>
                    <input type="text" name="name" className={hasValidationError(errors,"name") ? "has-input-error" : ""} onChange={onChange} value={form.name} autoComplete="off"/>
                    {hasValidationError(errors,"name") ? (<span className="has-cust-error">{validationError(errors,"name")}</span>) : null}
                </div>
                <div className="form-group">
                    <label className="label">Position</label>
                    <input type="text" name="position" className={hasValidationError(errors,"position") ? "has-input-error" : ""} onChange={onChange} value={form.position} autoComplete="off"/>
                    {hasValidationError(errors,"position") ? (<span className="has-cust-error">{validationError(errors,"position")}</span>) : null}
                </div>
                <div className="form-group">
                    <label className="label">Is Free?</label>
                    <SwitchButton labelText={form.is_free ? "Yes" : "No"} isEnabled={form.is_free} toggleButton={handleChangeIsFree}/>
                    {hasValidationError(errors,"is_free") ? (<span className="has-cust-error">{validationError(errors,"is_free")}</span>) : null}
                </div>
            </div>
            {!form.is_free ? (
                <div className="row-group">
                    <div className="form-group">
                        <label className="label">Price</label>
                        <input type="text" name="price" className={hasValidationError(errors,"price") ? "has-input-error" : ""} onChange={onChange} value={form.price} autoComplete="off"/>
                        {hasValidationError(errors,"price") ? (<span className="has-cust-error">{validationError(errors,"price")}</span>) : null}
                    </div>
                    <div className="form-group">
                        <label className="label">Type</label>
                        <select name="type" className={hasValidationError(errors,"type") ? "has-input-error rt-cust-select" : "rt-cust-select"} onChange={onChange} value={form.type} autoComplete="off">
                            <option value="">Select</option>
                            <option value="day">Day</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </select>
                        {hasValidationError(errors,"type") ? (<span className="has-cust-error">{validationError(errors,"type")}</span>) : null}
                    </div>
                    <div className="form-group">
                        <label className="label">Stripe Product Id</label>
                        <input type="text" name="stripe_product_id" className={hasValidationError(errors,"stripe_product_id") ? "has-input-error" : ""} onChange={onChange} value={form.stripe_product_id} autoComplete="off"/>
                        {hasValidationError(errors,"stripe_product_id") ? (<span className="has-cust-error">{validationError(errors,"stripe_product_id")}</span>) : null}
                    </div>
                    <div className="form-group">
                        <label className="label">Stripe Price Id</label>
                        <input type="text" name="stripe_price_id" className={hasValidationError(errors,"stripe_price_id") ? "has-input-error" : ""} onChange={onChange} value={form.stripe_price_id} autoComplete="off"/>
                        {hasValidationError(errors,"stripe_price_id") ? (<span className="has-cust-error">{validationError(errors,"stripe_price_id")}</span>) : null}
                    </div>
                </div>
            ) : null}
            <div className="form-group">
                <label className="label">Description</label>
                <TextEditor handleChange={(html) => handleCustom("description",html)} value={form.description} maxLength="5000"/>
                {hasValidationError(errors,"description") ? (<span className="has-cust-error">{validationError(errors,"description")}</span>) : null}
            </div>
            <div className="submit-wrap">
                <button type="submit" className="btn">Submit</button>
            </div>
        </MembershipWrapper>
    );
}
export default AddEditMembership;