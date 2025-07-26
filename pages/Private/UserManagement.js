import React,{useEffect,useState,useMemo,useCallback} from "react";
import Head from "next/head";
import debounce from "lodash/debounce";
import styled from "styled-components";
import sweetAlertHelper from "@helpers/SweetAlert";
import axios from "@utils/axios";
import axiosApi from "axios";
import {toast} from "react-toastify";
import {API_STATUS,APP_NAME,APP_SLUG,TOAST_OPTIONS,PER_PAGE} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import BiDataTable from "@helpers/BiDataTable";
import {USERS} from "@constants/ApiConstant";
import {handleUnauthorized,hasValidationError,validationError,focusOnFeild,focusOnFeildUsingClassName} from "@helpers/Frontend";
import {editIcon,deleteIcon,crossIcon,eyeIcon,eyeCloseIcon} from "@helpers/Icons";
import hasPermissions from "@helpers/UserRoles";
import colors from "@constants/Colors";
import SwitchButton from "@components/SwitchButton";
import CustomHeading from "@components/styled/Heading";
const Wrapper = styled.div`
    display:flex;flex-direction:column;row-gap:30px;
    & .top-wrap{
        display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;
        & .action-wrap{
            display:flex;gap:10px;flex-wrap:wrap;align-items:center;
            & .button{
                font-size:14px;color:${colors.WHITE};background:${colors.RED};border:none;border-radius:6px;cursor:pointer;transition:.2s;padding:10px 15px;
                &:hover{background:${colors.SECONDARY};}
            }
        }
    }
    @media(max-width:767px){
        & .top-wrap{
            gap:10px;
            & .action-wrap{
                & .button{padding:8px 10px;}
            }
        }
    }
`;
const PopupWrap = styled.div`
    position:fixed;top:0;bottom:0;left:0;right:0;z-index:1049;display:flex;justify-content:flex-end;background:#0000002b;box-sizing:border-box;
    & .back{position:absolute;left:0;top:0;right:0;bottom:0;box-sizing:border-box;cursor:pointer;}
    & .inner{
        background:${colors.SECONDARY};z-index:99999;max-width:350px;width:100%;position:relative;overflow:hidden;box-sizing:border-box;
        & .header{
            display:flex;align-items:center;column-gap:20px;justify-content:space-between;padding:15px 20px;background:${colors.PRIMARY};box-sizing:border-box;
            & span{font-size:20px;line-height:1;font-weight:600;color:${colors.WHITE};}
            & .actions{
                display:flex;align-items:center;column-gap:15px;
                & .clear{background:${colors.RED};border:none;border-radius:7px;padding:0 15px;color:white;font-size:15px;height:36px;cursor:pointer;}
                & .apply{
                    z-index:1;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:none;border-radius:20px;background:${colors.RED};cursor:pointer;
                    & svg{fill:${colors.WHITE};}
                }
            }
        }
        & .body{
            padding:20px;display:flex;flex-direction:column;max-height:calc(100vh - 70px);height:100%;overflow:hidden;overflow-y:auto;box-sizing:border-box;user-select:none;
            &::-webkit-scrollbar{width:6px;}
            &::-webkit-scrollbar-track{box-shadow:inset 0 0 6px #E2EFF6;}
            &::-webkit-scrollbar-thumb{background:#aaa;border-radius:10px;}
            &::-webkit-scrollbar-thumb:hover{background:#aaa;}
            & label{color:${colors.WHITE};}
            & .form-group{
                & input{background:none;color:${colors.WHITE};}
                & input:focus{outline:none;}
                & select{background:none;color:${colors.WHITE};}
            }
            & .submit-wrap{
                display:flex;align-items:center;column-gap:10px;justify-content:end;
                & .btn{
                    display:flex;align-items:center;justify-content:center;margin:0;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.RED};color:${colors.WHITE};border-radius:6px;font-weight:500;cursor:pointer;
                    &.cancel{background:${colors.CANCEL};}
                }
            }
        }
    }
    @media(max-width:767px){
        & .inner{
            & .body{
                & .submit-wrap{
                    & .btn{font-size:14px;height:38px;padding:0 10px;}
                }
            }
        }
    }
`;
const UserManagement = ({currentUser,userData,queryParams}) => {
    const [tableData,setTableData] = useState(userData);
    const [filters,setFilters] = useState(queryParams);
    const [sortOrders,setSortOrders] = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const [searchValue,setSearchValue] = useState("");
    const [form,setForm] = useState({first_name: "",last_name: "",email: "",phone: "",password: "",confirm_password: ""});
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const [showPopup,setShowPopup] = useState(false);
    const [passwordVisible,setPasswordVisible] = useState(false);
    const [confirmPasswordVisible,setConfirmPasswordVisible] = useState(false);
    const sortColumns = ["first_name","last_name","email","phone"];
    useEffect(() => {
        window.scrollTo(0,0);
        updateSortOrder();
    },[]);
    const statusComponent = (row) => {
        return (
            <SwitchButton labelText="" isEnabled={row.status} toggleButton={() => handleChangeStatus(row)}/>
        );
    }
    const actionComponent = (row) => {
        return (
            <div className="rt-datatable-actions">
                {(currentUser && hasPermissions(currentUser.roles,"USERS","EDIT")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"edit")} data-rt-tooltip="Edit">{editIcon({width:16,height:16})}</button>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"USERS","DELETE")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"delete")} data-rt-tooltip="Delete">{deleteIcon({width:16,height:16})}</button>
                ) : null}
            </div>
        );
    }
    const columns = [
        {label:"First Name",name:"first_name",orderable:true},
        {label:"Last Name",name:"last_name",orderable:true},
        {label:"Email",name:"email",orderable:true},
        {label:"Phone",name:"phone",orderable:true},
        {label:"Status",name:"status",classes:["w100"],component:statusComponent},
        {label:"Manage",name:"",classes:["w100"],component:actionComponent}
    ];
    const updateSortOrder = () => {
        let sortOrder = {};
        if(sortColumns.length > 0){
            sortColumns.forEach((column) => {
                if(filters.column === column && filters.dir === "desc"){
                    sortOrder[column] = 1;
                }else{
                    sortOrder[column] = -1;
                }
            });
        }else{
            columns.forEach((column) => {
                if(filters.column === column.name && filters.dir === "desc"){
                    sortOrder[column.name] = 1;
                }else{
                    sortOrder[column.name] = -1;
                }
            });
        }
        setSortOrders(sortOrder);
    }
    const getData = async(appliedFilters) => {
        try{
            setIsLoading(true);
            const {data} = await axios.get(USERS.LISTS,{params: appliedFilters});
            if(data.status == API_STATUS.SUCCESS){
                setIsLoading(false);
                setTableData(data.resData);
            }
            setIsLoading(false);
        }catch(e){
            setIsLoading(false);
        }
    }
    const sortBy = (column) => {
        if(column.orderable && (tableData && tableData.data && tableData.data.length > 0)){
            sortOrders[column.name] = sortOrders[column.name] * -1;
            filters.column = column.columnName ? column.columnName : column.name;
            filters.dir = sortOrders[column.name] === 1 ? "desc" : "asc";
            filters.page = 1;
            setSortOrders(sortOrders);
            setFilters(filters);
            getData(filters);
        }
    }
    const sendQuery = useCallback((value) => {
        filters.query = value;
        filters.page = 1;
        setFilters(filters);
        getData(filters);
    },[]);
    const debouncedSendQuery = useMemo(() => {
        return debounce(sendQuery,500);
    },[sendQuery]);
    const searchText = async(e) => {
        const {value} = e.target;
        setSearchValue(value);
        debouncedSendQuery(value);
    }
    const resetSearch = async() => {
        setSearchValue("");
        filters.query = "";
        filters.page = 1;
        setFilters(filters);
        getData(filters);
    }
    const perPageHandler = async(e) => {
        const {value} = e.target;
        filters.page = 1;
        filters.limit = value;
        setFilters(filters);
        getData(filters);
    }
    const paginationHandler = (pageNo) => {
        filters.page = pageNo;
        setFilters(filters);
        getData(filters);
    }
    const actionHandler = (row,type) => {
        if(type == "edit"){
            setForm({id: row.id,first_name: row.first_name,last_name: row.last_name,email: row.email,phone: row.phone});
            togglePopup(true);
        }else if(type == "delete"){
            sweetAlertHelper({title: "<strong>Confirm</strong>",html: `Are you sure you want to delete ${row.first_name}?`,showCancelButton: true}).then((result) => {
                if(result.isConfirmed){
                    deleteRecord(row.slug);
                }
            });
        }
    }
    const deleteRecord = async(slug) => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.delete(`${USERS.DELETE}/${slug}`);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                getData(filters);
            }else if(data.status == API_STATUS.UNPROCESSABLE_ENTITY){
                document.getElementById("custom-loader").style.display = "none";
                setErrors(data.errors);
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
    const handleChangeStatus = async(row) => {
        try{
            let updatedStatus = (row.status == 1) ? "0" : "1";
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(USERS.STATUS,{slug: row.slug,status: updatedStatus});
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                getData(filters);
            }
        }catch(e){
            document.getElementById("custom-loader").style.display = "none";
            if(e.response && e.response.data.message){
                toast.error(e.response.data.message,TOAST_OPTIONS);
            }
        }
    }
    const togglePopup = (status) => {
        if(status){
            setShowPopup(status);
            document.body.classList.add("no-overflow");
        }else{
            setShowPopup(false);
            document.body.classList.remove("no-overflow");
        }
    }
    const handleClosed = () => {
        setForm({first_name: "",last_name: "",email: "",phone: "",password: "",confirm_password: ""});
        setErrors([]);
        togglePopup(false);
        setPasswordVisible(false);
        setConfirmPasswordVisible(false);
    }
    const onChange = (e) => {
        let {name,value} = e.target;
        if(name == "name"){
            if(value == "" || (value && value.length <= 100)){
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
        const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const passRegix = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        let positionFocus = "";
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
        }else if(!emailReg.test(form.email)){
            newError["email"] = "Enter a valid email address";
            positionFocus = positionFocus || "email";
        }
        if(!form.id){
            if(!form.password || !form.password.trim()){
                newError["password"] = "Required";
                positionFocus = positionFocus || "password";
            }
            if(!form.confirm_password || !form.confirm_password.trim()){
                newError["confirm_password"] = "Required";
                positionFocus = positionFocus || "confirm_password";
            }
            if(form.password && form.password.length > 30){
                newError["password"] = "Maximum 30 characters allowed";
                positionFocus = positionFocus || "password";
            }else if(form.password && !passRegix.test(form.password)){
                newError["password"] = "Password must have at least 8 character and contain at least one of each: uppercase letter, one lowercase letter, number, and symbol.";
                positionFocus = positionFocus || "password";
            }else if(form.password && form.confirm_password && form.password != form.confirm_password){
                newError["confirm_password"] = "Password does not match.";
                positionFocus = positionFocus || "confirm_password";
            }
        }
        setErrors(newError);
        if(positionFocus){
            if(positionFocus.includes("cust-input-")){
                focusOnFeildUsingClassName(positionFocus);
            }else{
                focusOnFeild(positionFocus);
            }
            return false;
        }
        return true;
    }
    const handleSubmit = async() => {
        try{
            setSubmitting(true);
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(USERS.ADDUPDATE,form);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                setForm({first_name: "",last_name: "",email: "",phone: "",password: "",confirm_password: ""});
                getData(filters);
                togglePopup(false);
                setSubmitting(false);
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
            if(e.response.data.message){
                toast.error(e.data.message,TOAST_OPTIONS);
            }
        }
    }
    return (
        <React.Fragment>
            <Head>
                <title>{`User Management - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="users">
                {showPopup && (
                    <PopupWrap>
                        <div className="back" onClick={handleClosed}></div>
                        <form onSubmit={onSubmit} className="inner" autoComplete="off">
                            <div className="header">
                                <span className="heading">{form.id ? "Edit" : "Add"} User</span>
                                <div className="actions">
                                    <button className="apply" onClick={handleClosed} type="button">{crossIcon({width:24,height:24})}</button>
                                </div>
                            </div>
                            <div className="body">
                                <div className="form-group">
                                    <label className="label">First Name</label>
                                    <input type="text" name="first_name" className={hasValidationError(errors,"first_name") ? "has-input-error" : ""} onChange={onChange} value={form.first_name} autoComplete="off"/>
                                    {hasValidationError(errors,"first_name") ? (<span className="has-cust-error">{validationError(errors,"first_name")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Last Name</label>
                                    <input type="text" name="last_name" className={hasValidationError(errors,"last_name") ? "has-input-error" : ""} onChange={onChange} value={form.last_name} autoComplete="off"/>
                                    {hasValidationError(errors,"last_name") ? (<span className="has-cust-error">{validationError(errors,"last_name")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Email</label>
                                    <input type="text" name="email" className={hasValidationError(errors,"email") ? "has-input-error" : ""} onChange={onChange} value={form.email} autoComplete="off"/>
                                    {hasValidationError(errors,"email") ? (<span className="has-cust-error">{validationError(errors,"email")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Phone</label>
                                    <input type="text" name="phone" className={hasValidationError(errors,"phone") ? "has-input-error" : ""} onChange={onChange} value={form.phone} autoComplete="off"/>
                                    {hasValidationError(errors,"phone") ? (<span className="has-cust-error">{validationError(errors,"phone")}</span>) : null}
                                </div>
                                {!form.id ? (
                                    <>
                                        <div className="form-group">
                                            <label className="label">Password</label>
                                            <div className="password-wrap">
                                                <input className={hasValidationError(errors,"password") ? "has-input-error" : ""} type={passwordVisible ? "text" : "password"} name="password" onChange={onChange} value={form.password} autoComplete="off"/>
                                                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="visibility">
                                                    {passwordVisible ? (
                                                        eyeIcon({width:18,height:18,fill: colors.WHITE})
                                                    ) : (
                                                        eyeCloseIcon({width:18,height:18,fill: colors.WHITE})
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
                                                        eyeIcon({width:18,height:18,fill: colors.WHITE})
                                                    ) : (
                                                        eyeCloseIcon({width:18,height:18,fill: colors.WHITE})
                                                    )}
                                                </button>
                                            </div>
                                            {hasValidationError(errors,"confirm_password") ? (<span className="has-cust-error">{validationError(errors,"confirm_password")}</span>) : null}
                                        </div>
                                    </>
                                ) : null}
                                <div className="submit-wrap">
                                    <button onClick={handleClosed} type="button" className="btn cancel">Cancel</button>
                                    <button type="submit" className="btn">Submit</button>
                                </div>
                            </div>
                        </form>
                    </PopupWrap>
                )}
                <Wrapper>
                    <div className="top-wrap">
                        <CustomHeading>User Management</CustomHeading>
                        <div className="action-wrap">
                            {(currentUser && hasPermissions(currentUser.roles,"USERS","ADD")) ? (
                                <button className="button" type="button" onClick={() => togglePopup(true)}>Add User</button>
                            ) : null}
                        </div>
                    </div>
                    <BiDataTable tableData={tableData} columns={columns} isLoading={isLoading} filters={filters} perPage={PER_PAGE} showSearch={true} searchValue={searchValue} searchText={searchText} resetSearch={resetSearch} sortBy={sortBy} paginationHandler={paginationHandler} perPageHandler={perPageHandler}/>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    let userData = {data: [],current: 1,totalPages: 1},queryParams = {page:1,limit:10,column:"id",dir:"DESC",query:""};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(USERS.LISTS,{params: queryParams,headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            userData = data.resData;
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{userData,queryParams},"USERS:LIST");
}
export default UserManagement;