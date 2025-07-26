import React,{useState} from "react";
import styled from "styled-components";
import axios from "@utils/axios";
import {toast} from "react-toastify";
import {APP_NAME,API_STATUS,BASE_URL,DEFAULT_IMAGE_URL,FILE_ACCEPTS,FILE_TYPES,PAGE_TEMPLATES,TOAST_OPTIONS} from "@constants/Common";
import {MEDIA,PAGES} from "@constants/ApiConstant";
import {hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
import FrontImage from "@helpers/FrontImage";
import colors from "@constants/Colors";
import SwitchButton from "@components/SwitchButton";
import TextEditor from "@helpers/TextEditor";
const Wrapper = styled.form`
    background:${colors.PRIMARY};
    & .editor-header{
        padding:8px 20px;display:flex;align-items:center;column-gap:30px;justify-content:space-between;border-bottom:1px solid ${colors.BLACK};position:fixed;width:100%;box-sizing:border-box;background:${colors.SECONDARY};z-index:2;min-height:62px;top:0;
        & .logo-wrap{
            display:flex;column-gap:10px;align-items:center;cursor:pointer;
            & img{width:45px;display:flex;}
        }
        & .middle-wrap{
            display:flex;column-gap:20px;align-items:center;
            & .name{font-size:18px;color:${colors.WHITE};text-transform:capitalize;}
        }
        & .action-wrap{
            display:flex;align-items:center;justify-content:flex-end;column-gap:10px;
            & .btn{
                display:flex;align-items:center;justify-content:center;margin:0;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:6px;font-weight:500;cursor:pointer;
                &.cancel{background:${colors.CANCEL};}
            }
        }
    }
    & .editor-content-wrap{
        margin-top:62px;height:calc(100vh - 62px);
        & .editor-sidebar{
            background:${colors.SECONDARY};width:320px;height:100%;position:fixed;border-right:1px solid ${colors.BLACK};box-sizing:border-box;overflow-y:auto;
            & .tabs-wrap{
                display:flex;flex-wrap:wrap;align-items:center;
                & .tab{
                    display:flex;padding:12px 20px;background:${colors.PRIMARY};color:${colors.WHITE};flex:1;align-items:center;justify-content:center;cursor:pointer;
                    &:hover,
                    &.active{background:${colors.RED};}
                }
            }
            & .tabs-data{
                padding:15px;
                & .rt-cust-banner{display:none;}
                & .image-wrap{
                    display:flex;border:1px solid ${colors.BORDER};border-radius:6px;position:relative;width:100%;height:200px;max-width:400px;overflow:hidden;cursor:pointer;
                    & img{object-fit:cover;max-width:100%;max-height:100%;width:100%;}
                    & .btn-delete{background:${colors.RED};cursor:pointer;border:none;position:absolute;right:8px;top:8px;width:30px;height:30px;margin:0;padding:0;border-radius:30px;}
                }
                & .tags-wrap{
                    display:flex;column-gap:10px;row-gap:10px;flex-wrap:wrap;position:relative;list-style:none;padding:0;margin:10px 0 0;
                    & .tag{display:flex;align-items:center;padding:5px 10px;column-gap:5px;background:${colors.PRIMARY};border-radius:15px;font-size:12px;line-height:15px;overflow:hidden;white-space:pre-wrap;text-overflow:ellipsis;color:${colors.WHITE};}
                }
            }
        }
        & .editor-content{
            background:${colors.PRIMARY};height:100%;box-sizing:border-box;overflow-y:auto;margin-left:320px;padding:30px;display:flex;flex-direction:column;gap:30px;flex:1;
            & .editor-container{
                display:flex;gap:30px;box-sizing:border-box;
                & .column{
                    flex:1;position:relative;
                    & .image-wrap{
                        display:flex;position:relative;border-radius:10px;overflow:hidden;min-height:300px;height:100%;
                        & .file{display:none;}
                    }
                }
            }
            & .home-wrap{
                display:flex;flex-direction:column;gap:40px;
                & .item{
                    border:1px solid ${colors.WHITE};padding:20px;border-radius:6px;
                    & .heading{color:${colors.WHITE};font-size:20px;margin-bottom:15px;font-weight:600;}
                    & .image-wrap{
                        display:flex;border:1px solid ${colors.BORDER};border-radius:6px;position:relative;width:100%;height:500px;max-width:100%;overflow:hidden;cursor:pointer;
                        & .file{display:none;}
                        & img{object-fit:cover;max-width:100%;max-height:100%;width:100%;}
                        & .btn-delete{background:${colors.RED};cursor:pointer;border:none;position:absolute;right:8px;top:8px;width:30px;height:30px;margin:0;padding:0;border-radius:30px;}
                    }
                    & .form-group{
                        & .label{color:${colors.WHITE};}
                    }
                    & .item-inner{
                        display:flex;gap:20px;
                        & .left{
                            width:50%;
                            & .delete{font-size:16px;background:${colors.RED};border:none;color:${colors.WHITE};height:42px;padding:0 20px;border-radius:6px;cursor:pointer;margin-top:26px;}        
                        }
                        & .right{width:50%;}
                    }
                    & .testi-item{
                        display:flex;gap:20px;margin-top:30px;
                        & .image-wrap{
                            width:100%;height:200px;max-width:200px;overflow:hidden;cursor:pointer;
                            & img{object-fit:cover;max-width:100%;max-height:100%;width:100%;}
                            & .btn-delete{background:${colors.RED};cursor:pointer;border:none;position:absolute;right:8px;top:8px;width:30px;height:30px;margin:0;padding:0;border-radius:30px;}
                        }
                        & .info{
                            flex:1;
                            & .delete{font-size:16px;background:${colors.RED};border:none;color:${colors.WHITE};height:42px;padding:0 20px;border-radius:6px;cursor:pointer;margin-top:26px;}    
                        }
                    }
                    & .add{font-size:16px;background:${colors.GREEN};border:none;color:${colors.WHITE};height:42px;padding:0 20px;border-radius:6px;cursor:pointer; margin:26px auto 0;display:block;}    
                }
            }
        }
    }
`;
const AddEditPage = ({pageData}) => {
    const [selectedLayout,setSelectedLayout] = useState("general");
    const [form,setForm] = useState(pageData);
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const onChange = (e) => {
        const {name,value} = e.target;
        if(name == "first_name" || name == "last_name"){
            if(value == "" || (value && value.length <= 100)){
                handleCustom(name,value);
            }
        }else if(name == "email"){
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
    const handleChangeMap = () => {
        let isMapVisible = (form.contact_is_map_visible ? false : true);
        handleCustom("contact_is_map_visible",isMapVisible);
        handleCustom("contact_map_url","");
    }
    const changeUploadFile = (element) => {
        document.querySelector(element).value = "";
        document.querySelector(element).click();
    }
    const handleImageChange = (key,files,componentIndex = "",columnIndex = "") => {
        if(!files.length){
            return;
        }
        let type = files[0].type.split("/")[0];
        let ext = files[0].type.split("/")[1];
        if(type === "image" && FILE_TYPES.IMAGES.includes(ext)){
            uploadMedia("image",key,files[0],componentIndex,columnIndex);
        }
    }
    const uploadMedia = async(type,key,file,componentIndex,columnIndex) => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            var formData = new FormData();
            formData.append("type",type);
            formData.append("media",file);
            const {data} = await axios.post(MEDIA.UPLOAD,formData);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                if(componentIndex !== "" && columnIndex !== ""){
                    handleComponentChange(key,data.mediaUrl,componentIndex,columnIndex);
                }else if(componentIndex !== ""){
                    onComponentTestimonialChange(key,data.mediaUrl,componentIndex);
                }else{
                    onComponentChange(key,data.mediaUrl);
                }
            }else{
                document.getElementById("custom-loader").style.display = "none";
                toast.error(data.message,TOAST_OPTIONS);
            }
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    const handleComponentChange = (name,value,componentIndex,columnIndex) => {
        let pageComponents = Object.assign([],form.page_components);
        pageComponents[componentIndex].columns[columnIndex][name] = value;
        handleCustom("page_components",pageComponents);
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
        if(form.template == "contacts"){
            if(form.contact_email && form.contact_email.length > 100){
                newError["contact_email"] = "Maximum 100 characters allowed";
                positionFocus = positionFocus || "contact_email";
            }
            if(form.contact_phone && form.contact_phone.length > 12){
                newError["contact_phone"] = "Maximum 12 characters allowed";
                positionFocus = positionFocus || "contact_phone";
            }
            if(form.contact_address && form.contact_address.length > 250){
                newError["contact_address"] = "Maximum 250 characters allowed";
                positionFocus = positionFocus || "contact_address";
            }
            if(form.contact_is_map_visible){
                if(!form.contact_map_url || !form.contact_map_url.trim()){
                    newError["contact_map_url"] = "Required";
                    positionFocus = positionFocus || "contact_map_url";
                }else if(form.contact_map_url && form.contact_map_url.length > 500){
                    newError["contact_map_url"] = "Maximum 500 characters allowed";
                    positionFocus = positionFocus || "contact_map_url";
                }
            }
        }
        if(form.meta_title && form.meta_title.length > 100){
            newError["meta_title"] = "Maximum 100 characters allowed";
            positionFocus = positionFocus || "meta_title";
        }
        if(form.meta_description && form.meta_description.length > 300){
            newError["meta_description"] = "Maximum 300 characters allowed";
            positionFocus = positionFocus || "meta_description";
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
            const {data} = await axios.post(PAGES.ADDUPDATE,form);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                setTimeout(() => {
                    window.location = `${BASE_URL}/admin/pages`;
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
    const handleGoBack = () => {
        window.location = `${BASE_URL}/admin/pages`;
    }
    const handleLayout = (item) => {
        setSelectedLayout(item);
    }
    const onComponentChange = (name,value) => {
        let pageComponents = Object.assign({},form.page_components);
        pageComponents[name] = value;
        handleCustom("page_components",pageComponents);
    }
    const onFeaturesChange = (name,value,index) => {
        let pageComponents = Object.assign({},form.page_components);
        pageComponents.s3_features[index][name] = value;
        handleCustom("page_components",pageComponents);
    }
    const onComponentTestimonialChange = (name,value,index) => {
        let pageComponents = Object.assign({},form.page_components);
        pageComponents.s4_testimonials[index][name] = value;
        handleCustom("page_components",pageComponents);
    }
    const addFeature = () => {
        const newFeature = {heading:"",description:"",};
        handleCustom("page_components",{...form.page_components,s3_features:[...form.page_components.s3_features, newFeature]});
    }
    const deleteFeature = (index) => {
        const updatedFeatures = form.page_components.s3_features.filter((_, i) => i !== index);
        handleCustom("page_components",{...form.page_components,s3_features:updatedFeatures});
    }
    const addTestimonial = () => {
        const newTestimonial = {image:"", content:"",name:"",location:"",};
        handleCustom("page_components",{...form.page_components,s4_testimonials:[...form.page_components.s4_testimonials,newTestimonial],});
    }
    const deleteTestimonial = (index) => {
        const updatedTestimonials = form.page_components.s4_testimonials.filter((_, i) => i !== index);
        handleCustom("page_components",{...form.page_components,s4_testimonials:updatedTestimonials});
    }
    return (
        <Wrapper onSubmit={onSubmit} autoComplete="off">
            <div className="editor-header">
                <a className="logo-wrap" onClick={handleGoBack}>
                    <img src={`${BASE_URL}/assets/images/logo.png`} alt={APP_NAME}/>
                </a>
                <div className="middle-wrap">
                    <div className="name">{pageData.id ? "Edit" : "Add Page"} {pageData.name}</div>
                </div>
                <div className="action-wrap">
                    <button type="button" className="btn cancel" onClick={handleGoBack}>Cancel</button>
                    <button type="submit" className="btn" >Save</button>
                </div>
            </div>
            <div className="editor-content-wrap">
                <div className="editor-sidebar">
                    <div className="tabs-wrap">
                        <div className={`tab ${((selectedLayout == "general") ? "active" : "")}`} onClick={() => handleLayout('general')}>General</div>
                        <div className={`tab ${((selectedLayout == "seo") ? "active" : "")}`} onClick={() => handleLayout('seo')}>SEO</div>
                    </div>
                    {(selectedLayout == "general") ? (
                        <div className="tabs-data">
                            <div className="form-group">
                                <label className="label">Title</label>
                                <textarea className={hasValidationError(errors,"name") ? "has-input-error" : ""} name="name" onChange={onChange} value={form.name}/>
                                {hasValidationError(errors,"name") ? (<span className="has-cust-error">{validationError(errors,"name")}</span>) : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Template</label>
                                <select name="template" className={hasValidationError(errors,"template") ? "has-input-error rt-cust-select" : "rt-cust-select"} onChange={onChange} value={form.template} autoComplete="off">
                                    {PAGE_TEMPLATES.map((template) => (
                                        <option value={template.id}>{template.name}</option>
                                    ))}
                                </select>
                                {hasValidationError(errors,"template") ? (<span className="has-cust-error">{validationError(errors,"template")}</span>) : null}
                            </div>
                            {form.template == "contacts" ? (
                                <>
                                    <div className="form-group">
                                        <label className="label">Email Address</label>
                                        <input type="text" className={hasValidationError(errors,"contact_email") ? "has-input-error" : ""} name="contact_email" onChange={onChange} value={form.contact_email}/>
                                        {hasValidationError(errors,"contact_email") ? (<span className="has-cust-error">{validationError(errors,"contact_email")}</span>) : null}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Phone Number</label>
                                        <input type="text" className={hasValidationError(errors,"contact_phone") ? "has-input-error" : ""} name="contact_phone" onChange={onChange} value={form.contact_phone}/>
                                        {hasValidationError(errors,"contact_phone") ? (<span className="has-cust-error">{validationError(errors,"contact_phone")}</span>) : null}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Address</label>
                                        <textarea className={hasValidationError(errors,"contact_address") ? "has-input-error" : ""} name="contact_address" onChange={onChange} value={form.contact_address}/>
                                        {hasValidationError(errors,"contact_address") ? (<span className="has-cust-error">{validationError(errors,"contact_address")}</span>) : null}
                                    </div>
                                    <div className="form-group w100">
                                        <label className="label">Is Map Visible</label>
                                        <SwitchButton labelText={form.contact_is_map_visible ? "Yes" : "No"} isEnabled={form.contact_is_map_visible} toggleButton={handleChangeMap}/>
                                        {hasValidationError(errors,"contact_is_map_visible") ? (<span className="has-cust-error">{validationError(errors,"contact_is_map_visible")}</span>) : null}
                                    </div>
                                    {form.contact_is_map_visible ? (
                                        <div className="form-group full">
                                            <label className="label">Map URL</label>
                                            <textarea className={hasValidationError(errors,"contact_map_url") ? "has-input-error" : ""} name="contact_map_url" onChange={onChange} value={form.contact_map_url}/>
                                            {hasValidationError(errors,"contact_map_url") ? (<span className="has-cust-error">{validationError(errors,"contact_map_url")}</span>) : null}
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                    ) : (selectedLayout == "seo") ? (
                        <div className="tabs-data">
                            <div className="form-group">
                                <label className="label">Meta Title</label>
                                <textarea className={hasValidationError(errors,"meta_title") ? "has-input-error" : ""} name="meta_title" onChange={onChange} value={form.meta_title}/>
                                {hasValidationError(errors,"meta_title") ? (<span className="has-cust-error">{validationError(errors,"meta_title")}</span>) : null}
                            </div>
                            <div className="form-group">
                                <label className="label">Meta Description</label>
                                <textarea className={hasValidationError(errors,"meta_description") ? "has-input-error" : ""} name="meta_description" onChange={onChange} value={form.meta_description}/>
                                {hasValidationError(errors,"meta_description") ? (<span className="has-cust-error">{validationError(errors,"meta_description")}</span>) : null}
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="editor-content">
                    {form.link == "home" ? (
                        <div className="home-wrap">
                            <div className="item">
                                <div className="heading">Section 1</div>
                                <div className="form-group">
                                    <label className="label">Heading</label>
                                    <input type="text" value={form.page_components.s1_heading} onChange={(e) => onComponentChange("s1_heading",e.target.value)}/>
                                </div>
                                <div className="form-group">
                                    <label className="label">Sub Heading</label>
                                    <input type="text" value={form.page_components.s1_sub_heading} onChange={(e) => onComponentChange("s1_sub_heading",e.target.value)}/>
                                </div>
                                <div className="row-group">
                                    <div className="form-group">
                                        <label className="label">Button 1 Name</label>
                                        <input type="text" value={form.page_components.s1_button_1_text} onChange={(e) => onComponentChange("s1_button_1_text",e.target.value)}/>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Button 1 Link</label>
                                        <input type="text" value={form.page_components.s1_button_1_url} onChange={(e) => onComponentChange("s1_button_1_url",e.target.value)}/>
                                    </div>
                                </div>
                                <div className="row-group">
                                    <div className="form-group">
                                        <label className="label">Button 2 Name</label>
                                        <input type="text" value={form.page_components.s1_button_2_text} onChange={(e) => onComponentChange("s1_button_2_text",e.target.value)}/>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Button 2 Link</label>
                                        <input type="text" value={form.page_components.s1_button_2_url} onChange={(e) => onComponentChange("s1_button_2_url",e.target.value)}/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="image-wrap">
                                        <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-cust-image-s1 file" onChange={(e) => handleImageChange("s1_image",e.target.files)}/>
                                        <FrontImage onClick={() => changeUploadFile('.rt-cust-image-s1')} src={form.page_components.s1_image || DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Description</label>
                                    <TextEditor handleChange={(html) => onComponentChange("s1_description",html)} value={form.page_components.s1_description}/>
                                </div>
                            </div>
                            <div className="item">
                                <div className="heading">Section 2</div>
                                <div className="item-inner">
                                    <div className="left">
                                        <div className="form-group">
                                            <label className="label">Heading</label>
                                            <input type="text" value={form.page_components.s2_heading} onChange={(e) => onComponentChange("s2_heading",e.target.value)}/>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Description</label>
                                            <TextEditor handleChange={(html) => onComponentChange("s2_description",html)} value={form.page_components.s2_description}/>
                                        </div>
                                        <div className="row-group">
                                            <div className="form-group">
                                                <label className="label">Button 1 Name</label>
                                                <input type="text" value={form.page_components.s2_button_1_text} onChange={(e) => onComponentChange("s2_button_1_text",e.target.value)}/>
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Button 1 Link</label>
                                                <input type="text" value={form.page_components.s2_button_1_url} onChange={(e) => onComponentChange("s2_button_1_url",e.target.value)}/>
                                            </div>
                                        </div>
                                        <div className="row-group">
                                            <div className="form-group">
                                                <label className="label">Button 2 Name</label>
                                                <input type="text" value={form.page_components.s2_button_2_text} onChange={(e) => onComponentChange("s2_button_2_text",e.target.value)}/>
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Button 2 Link</label>
                                                <input type="text" value={form.page_components.s2_button_2_url} onChange={(e) => onComponentChange("s2_button_2_url",e.target.value)}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <div className="image-wrap">
                                            <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-cust-image-s2 file" onChange={(e) => handleImageChange("s2_image",e.target.files)}/>
                                            <FrontImage onClick={() => changeUploadFile('.rt-cust-image-s2')} src={form.page_components.s2_image || DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="heading">Section 3</div>
                                <div className="form-group">
                                    <label className="label">Heading</label>
                                    <input type="text" value={form.page_components.s3_heading} onChange={(e) => onComponentChange("s3_heading",e.target.value)}/>
                                </div>
                                <div className="form-group">
                                    <label className="label">Sub Heading</label>
                                    <input type="text" value={form.page_components.s3_description} onChange={(e) => onComponentChange("s3_description",e.target.value)}/>
                                </div>
                                <div className="item-inner">
                                    <div className="right">
                                        <div className="image-wrap">
                                            <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-cust-image-s3 file" onChange={(e) => handleImageChange("s3_image",e.target.files)}/>
                                            <FrontImage onClick={() => changeUploadFile('.rt-cust-image-s3')} src={form.page_components.s3_image || DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                        </div>
                                    </div>
                                    <div className="left">
                                        {form.page_components.s3_features.map((s3_features,index) => (
                                            <div className="row-group" key={index}>
                                                <div className="form-group">
                                                    <label className="label">Heading</label>
                                                    <input type="text" value={s3_features.heading} onChange={(e) => onFeaturesChange("heading",e.target.value,index)}/>
                                                </div>
                                                <div className="form-group">
                                                    <label className="label">Description</label>
                                                    <input type="text" value={s3_features.description} onChange={(e) => onFeaturesChange("description",e.target.value,index)}/>
                                                </div>
                                                <button type="button" className="delete" onClick={() => deleteFeature(index)}>Delete</button>
                                            </div>
                                        ))}
                                        <button type="button" className="add" onClick={addFeature}>Add Feature</button>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="heading">Section 4</div>
                                <div className="form-group">
                                    <label className="label">Heading</label>
                                    <input type="text" value={form.page_components.s4_heading} onChange={(e) => onComponentChange("s4_heading",e.target.value)}/>
                                </div>
                                <div className="form-group">
                                    <label className="label">Sub Heading</label>
                                    <input type="text" value={form.page_components.s4_sub_heading} onChange={(e) => onComponentChange("s4_sub_heading",e.target.value)}/>
                                </div>
                                    {form.page_components.s4_testimonials.map((testimonial,index) => (
                                        <div className="testi-item" key={index}>
                                            <div className="image-wrap">
                                                <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className={`rt-cust-image-testimonial-${index} file`} onChange={(e) => handleImageChange("image",e.target.files,index)}/>
                                                <FrontImage onClick={() => changeUploadFile(`.rt-cust-image-testimonial-${index}`)} src={testimonial.image || DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                            </div>
                                            <div className="info">
                                                <div className="form-group">
                                                    <label className="label">Content</label>
                                                    <textarea value={testimonial.content} onChange={(e) => onComponentTestimonialChange("content",e.target.value,index)}/>
                                                </div>
                                                <div className="row-group">
                                                    <div className="form-group">
                                                        <label className="label">Name</label>
                                                        <input type="text" value={testimonial.name} onChange={(e) => onComponentTestimonialChange("name",e.target.value,index)}/>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="label">Location</label>
                                                        <input type="text" value={testimonial.location} onChange={(e) => onComponentTestimonialChange("location",e.target.value,index)}/>
                                                    </div>
                                                    <button className="delete" type="button" onClick={() => deleteTestimonial(index)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className="add" onClick={addTestimonial}>Add Testimonial</button>
                            </div>
                        </div>
                    ) : form.page_components.length > 0 ? form.page_components.map((pageComponent,componentIndex) => (
                        <div className="editor-container" key={componentIndex}>
                            {pageComponent.columns.map((component,columnIndex) => (
                                <div className={`column col-${component.width}`} key={columnIndex}>
                                    {component.type == "image" ? (
                                        <div className="image-wrap">
                                            <input type="file" accept={FILE_ACCEPTS.IMAGES} name="file" className="rt-cust-image file" onChange={(e) => handleImageChange("image",e.target.files,componentIndex,columnIndex)}/>
                                            <FrontImage onClick={() => changeUploadFile('.rt-cust-image')} src={component.image ? component.image : DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                        </div>
                                    ) : component.type == "editor" ? (
                                        <TextEditor handleChange={(html) => handleComponentChange("text",html,componentIndex,columnIndex)} value={component.text} maxLength="5000"/>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )) : null}
                </div>
            </div>
        </Wrapper>
    );
}
export default AddEditPage;