import React,{useEffect,useState,useMemo,useCallback} from "react";
import Head from "next/head";
import debounce from "lodash/debounce";
import styled from "styled-components";
import sweetAlertHelper from "@helpers/SweetAlert";
import axios from "@utils/axios";
import axiosApi from "axios";
import {toast} from "react-toastify";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL,TOAST_OPTIONS,PER_PAGE} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import BiDataTable from "@helpers/BiDataTable";
import {PAGES} from "@constants/ApiConstant";
import {handleUnauthorized,dateWithFormatWithLocal} from "@helpers/Frontend";
import {editIcon,eyeIcon,deleteIcon} from "@helpers/Icons";
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
const Pages = ({currentUser,pageData,queryParams}) => {
    const [tableData,setTableData] = useState(pageData);
    const [filters,setFilters] = useState(queryParams);
    const [sortOrders,setSortOrders] = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const [searchValue,setSearchValue] = useState("");
    const sortColumns = ["name","template","created_at"];
    useEffect(() => {
        window.scrollTo(0,0);
        updateSortOrder();
    },[]);
    const dateComponent = (row) => {
        return dateWithFormatWithLocal(row.created_at,"MMM DD, YYYY");
    }
    const statusComponent = (row) => {
        return (
            <SwitchButton labelText="" isEnabled={row.status} toggleButton={() => handleChangeStatus(row)}/>
        );
    }
    const actionComponent = (row) => {
        return (
            <div className="rt-datatable-actions">
                {(currentUser && hasPermissions(currentUser.roles,"PAGES","VIEW")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"view")} data-rt-tooltip="View">{eyeIcon({width:16,height:16})}</button>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"PAGES","EDIT")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"edit")} data-rt-tooltip="Edit">{editIcon({width:16,height:16})}</button>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"PAGES","DELETE")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"delete")} data-rt-tooltip="Delete">{deleteIcon({width:16,height:16})}</button>
                ) : null}
            </div>
        );
    }
    const columns = [
        {label:"Name",name:"name",orderable:true},
        {label:"Template",name:"template",orderable:true,classes:["text-capitalize"]},
        {label:"Created Date",name:"created_at",orderable:true,classes:["w100"],component:dateComponent},
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
            const {data} = await axios.get(PAGES.LISTS,{params: appliedFilters});
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
        if(type == "view"){
            if(row.link != "home"){
                window.open(`${BASE_URL}/${row.link}`,'_blank');
            }else{
                window.open(BASE_URL,'_blank');
            }
        }else if(type == "edit"){
            window.location = `${BASE_URL}/admin/pages/edit/${row.slug}`;
        }else if(type == "delete"){
            sweetAlertHelper({title: "<strong>Confirm</strong>",html: `Are you sure you want to delete ${row.name}?`,showCancelButton: true}).then((result) => {
                if(result.isConfirmed){
                    deleteRecord(row.slug);
                }
            });
        }
    }
    const deleteRecord = async(slug) => {
        try{
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.delete(`${PAGES.DELETE}/${slug}`);
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
            const {data} = await axios.post(PAGES.STATUS,{slug: row.slug,status: updatedStatus});
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
    return (
        <React.Fragment>
            <Head>
                <title>{`CMS Pages - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="pages">
                <Wrapper>
                    <div className="top-wrap">
                        <CustomHeading>CMS Pages</CustomHeading>
                        <div className="action-wrap">
                            {(currentUser && hasPermissions(currentUser.roles,"PAGES","ADD")) ? (
                                <a className="button" href={`${BASE_URL}/admin/pages/add`}>Add Page</a>
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
    let pageData = {data: [],current: 1,totalPages: 1},queryParams = {page:1,limit:10,column:"id",dir:"DESC",query:""};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(PAGES.LISTS,{params: queryParams,headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            pageData = data.resData;
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{pageData,queryParams},"PAGES:LIST");
}
export default Pages;