import React,{useEffect,useState,useMemo,useCallback} from "react";
import Head from "next/head";
import debounce from "lodash/debounce";
import styled from "styled-components";
import sweetAlertHelper from "@helpers/SweetAlert";
import axios from "@utils/axios";
import axiosApi from "axios";
import BackendLayout from "@components/Layouts/Backend";
import {getServerProps} from "@utils/authUtils";
import {toast} from "react-toastify";
import {API_STATUS,APP_NAME,APP_SLUG,TOAST_OPTIONS,PER_PAGE} from "@constants/Common";
import BiDataTable from "@helpers/BiDataTable";
import {FAQS} from "@constants/ApiConstant";
import colors from "@constants/Colors";
import hasPermissions from "@helpers/UserRoles";
import {crossIcon,editIcon,deleteIcon} from "@helpers/Icons";
import {handleUnauthorized,hasValidationError,validationError,focusOnFeild} from "@helpers/Frontend";
import SwitchButton from "@components/SwitchButton";
import CustomHeading from "@components/styled/Heading";
const Wrap = styled.div`
    display:flex;flex-direction:column;row-gap:20px;
    & .head-wrap{
        display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;
        & .action-wrap{
            display:flex;gap:10px;flex-wrap:wrap;align-items:center;
            & .button{font-size:14px;color:${colors.WHITE};background:${colors.RED};border:none;border-radius:6px;cursor:pointer;transition:.2s;padding:8px 15px;}
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
            & .submit-wrap{
                display:flex;align-items:center;column-gap:10px;justify-content:end;
                & .btn{
                    display:flex;align-items:center;justify-content:center;margin:0;padding:0 15px;height:40px;font-size:16px;border:none;background:${colors.BLACK};color:${colors.WHITE};border-radius:6px;font-weight:500;cursor:pointer;
                    &:hover{background:${colors.RED};}
                }
            }
        }
    }
`;
const Faqs = ({currentUser,genreData,queryParams}) => {
    const [tableData,setTableData] = useState(genreData);
    const [filters,setFilters] = useState(queryParams);
    const [sortOrders,setSortOrders] = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const [searchValue,setSearchValue] = useState("");
    const [form,setForm] = useState({question: "",answer: "",display_position: ""});
    const [errors,setErrors] = useState([]);
    const [submitting,setSubmitting] = useState(false);
    const [showPopup,setShowPopup] = useState(false);
    const sortColumns = ["question","display_position"];
    useEffect(() => {
        window.scrollTo(0,0);
        updateSortOrder();
    },[]);
    const statusComponent = (row) => {
        return (
            <SwitchButton labelText="" tooltip={true} isEnabled={row.status} toggleButton={() => handleChangeStatus(row)}/>
        );
    }
    const actionComponent = (row) => {
        return (
            <div className="rt-datatable-actions">
                {(currentUser && hasPermissions(currentUser.roles,"FAQS","EDIT")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"edit")} data-rt-tooltip="Edit">{editIcon({width:16,height:16})}</button>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"FAQS","DELETE")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"delete")} data-rt-tooltip="Delete">{deleteIcon({width:16,height:16})}</button>
                ) : null}
            </div>
        );
    }
    const columns = [
        {label:"Question",name:"question",orderable:true},
        {label:"Display Position",name:"display_position",orderable:true},
        {label:"Status",name:"status",component:statusComponent},
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
            const {data} = await axios.get(FAQS.LISTS,{params: appliedFilters});
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
            setForm({id: row.id,slug: row.slug,question: row.question,answer: row.answer,display_position: row.display_position});
            setErrors([]);
            togglePopup(true);
        }else if(type == "delete"){
            sweetAlertHelper({title: "<strong>Confirm</strong>",html: `Are you sure you want to delete this Faq?`,showCancelButton: true}).then((result) => {
                if(result.isConfirmed){
                    deleteRecord(row.slug);
                }
            });
        }
    }
    const deleteRecord = async(rowSlug) => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.delete(`${FAQS.DELETE}/${rowSlug}`);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                getData(filters);
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
            const {data} = await axios.post(FAQS.STATUS,{slug: row.slug,status: updatedStatus});
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
        setForm({question: "",answer: "",display_position: ""});
        setErrors([]);
        togglePopup(false);
    }
    const onChange = (e) => {
        let {name,value} = e.target;
        if(name == "question" || name == "answer"){
            if(value == "" || (value && value.length <= 500)){
                handleCustom(name,value);
            }
        }else if(name == "display_position"){
            let newValue = value.replace(/[^0-9]/gi,"");
            if(newValue == "" || (newValue >= 1 && newValue <= 99999)){
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
        if(!form.question || !form.question.trim()){
            newError["question"] = "Required";
            positionFocus = positionFocus || "question";
        }
        if(!form.answer || !form.answer.trim()){
            newError["answer"] = "Required";
            positionFocus = positionFocus || "answer";
        }
        if(!form.display_position){
            newError["display_position"] = "Required";
            positionFocus = positionFocus || "display_position";
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
            const {data} = await axios.post(FAQS.ADDUPDATE,form);
            if(data.status == API_STATUS.SUCCESS){
                document.getElementById("custom-loader").style.display = "none";
                toast.success(data.message,TOAST_OPTIONS);
                setForm({question: "",answer: "",display_position: ""});
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
                <title>{`FAQs - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="faqs">
                {showPopup && (
                    <PopupWrap>
                        <div className="back" onClick={handleClosed}></div>
                        <form onSubmit={onSubmit} className="inner" autoComplete="off">
                            <div className="header">
                                <span className="heading">{form.slug ? "Edit" : "Add"} FAQ</span>
                                <div className="actions">
                                    <button className="apply" onClick={handleClosed} type="button">{crossIcon({width:24,height:24})}</button>
                                </div>
                            </div>
                            <div className="body">
                                <div className="form-group">
                                    <label className="label">Question</label>
                                    <input type="text" name="question" className={hasValidationError(errors,"question") ? "has-input-error" : ""} onChange={onChange} value={form.question} autoComplete="off"/>
                                    {hasValidationError(errors,"question") ? (<span className="has-cust-error">{validationError(errors,"question")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Answer</label>
                                    <textarea name="answer" className={hasValidationError(errors,"answer") ? "has-input-error" : ""} onChange={onChange} value={form.answer} autoComplete="off" rows="5"/>
                                    {hasValidationError(errors,"answer") ? (<span className="has-cust-error">{validationError(errors,"answer")}</span>) : null}
                                </div>
                                <div className="form-group">
                                    <label className="label">Display Position</label>
                                    <input type="text" name="display_position" className={hasValidationError(errors,"display_position") ? "has-input-error" : ""} onChange={onChange} value={form.display_position} autoComplete="off"/>
                                    {hasValidationError(errors,"display_position") ? (<span className="has-cust-error">{validationError(errors,"display_position")}</span>) : null}
                                </div>
                                <div className="submit-wrap">
                                    <button type="submit" className="btn">Submit</button>
                                    <button onClick={handleClosed} type="button" className="btn">Cancel</button>
                                </div>
                            </div>
                        </form>
                    </PopupWrap>
                )}
                <Wrap>
                    <div className="head-wrap">
                        <CustomHeading>FAQs</CustomHeading>
                        <div className="action-wrap">
                            {(currentUser && hasPermissions(currentUser.roles,"FAQS","ADD")) ? (
                                <button className="button" type="button" onClick={() => togglePopup(true)}>Add Faq</button>
                            ) : null}
                        </div>
                    </div>
                    <BiDataTable tableData={tableData} columns={columns} isLoading={isLoading} filters={filters} perPage={PER_PAGE} showSearch={true} searchValue={searchValue} searchText={searchText} resetSearch={resetSearch} sortBy={sortBy} paginationHandler={paginationHandler} perPageHandler={perPageHandler}/>
                </Wrap>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    let genreData = {data: [],current: 1,totalPages: 1},queryParams = {page:1,limit:10,column:"display_position",dir:"ASC",query:""};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(FAQS.LISTS,{params: queryParams,headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            genreData = data.resData;
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{genreData,queryParams},"FAQS:LIST");
}
export default Faqs;