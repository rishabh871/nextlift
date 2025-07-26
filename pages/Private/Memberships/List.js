import React,{useEffect,useState} from "react";
import Head from "next/head";
import styled from "styled-components";
import axios from "@utils/axios";
import axiosApi from "axios";
import {toast} from "react-toastify";
import {API_STATUS,APP_NAME,APP_SLUG,BASE_URL,TOAST_OPTIONS} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import BiDataTable from "@helpers/BiDataTable";
import {MEMBERSHIPS} from "@constants/ApiConstant";
import {handleUnauthorized} from "@helpers/Frontend";
import {editIcon} from "@helpers/Icons";
import hasPermissions from "@helpers/UserRoles";
import SwitchButton from "@components/SwitchButton";
import CustomHeading from "@components/styled/Heading";
const Wrapper = styled.div`
    display:flex;flex-direction:column;row-gap:30px;
`;
const Memberships = ({currentUser,membershipData,queryParams}) => {
    const [tableData,setTableData] = useState(membershipData);
    const [filters,setFilters] = useState(queryParams);
    const [sortOrders,setSortOrders] = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const sortColumns = ["name","last_name","email","phone"];
    useEffect(() => {
        window.scrollTo(0,0);
        updateSortOrder();
    },[]);
    const priceComponent = (row) => {
        if(row.price){
            return Number(row.price).toLocaleString("en-US",{style: "currency",currency: "USD",maximumFractionDigits: 0,minimumFractionDigits: 0}) + ' / ' + row.type;
        }else{
            return "Free";
        }
    }
    const statusComponent = (row) => {
        return (
            <SwitchButton labelText="" isEnabled={row.status} toggleButton={() => handleChangeStatus(row)}/>
        );
    }
    const actionComponent = (row) => {
        return (
            <div className="rt-datatable-actions">
                {(currentUser && hasPermissions(currentUser.roles,"MEMBERSHIPS","EDIT")) ? (
                    <button className="box-button" onClick={() => actionHandler(row,"edit")} data-rt-tooltip="Edit">{editIcon({width:16,height:16})}</button>
                ) : null}
            </div>
        );
    }
    const columns = [
        {label:"Name",name:"name",orderable:true},
        {label:"Price",name:"price",orderable:true,component:priceComponent},
        {label:"Display Position",name:"position",orderable:true,classes:["w100"]},
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
            const {data} = await axios.get(MEMBERSHIPS.LISTS,{params: appliedFilters});
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
            window.location = `${BASE_URL}/admin/memberships/edit/${row.slug}`;
        }
    }
    const handleChangeStatus = async(row) => {
        try{
            let updatedStatus = (row.status == 1) ? "0" : "1";
            document.getElementById("custom-loader").style.display = "block";
            const {data} = await axios.post(MEMBERSHIPS.STATUS,{slug: row.slug,status: updatedStatus});
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
                <title>{`Memberships - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="memberships">
                <Wrapper>
                    <CustomHeading>Memberships</CustomHeading>
                    <BiDataTable tableData={tableData} columns={columns} isLoading={isLoading} filters={filters} showHeader={false} sortBy={sortBy} paginationHandler={paginationHandler} perPageHandler={perPageHandler}/>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    let membershipData = {data: [],current: 1,totalPages: 1},queryParams = {page:1,limit:20,column:"position",dir:"ASC",query:""};
    let token = context.req.cookies[`${APP_SLUG}-token`] || "";
    try{
        const {data} = await axiosApi.get(MEMBERSHIPS.LISTS,{params: queryParams,headers: {authorization: token}});
        if(data.status == API_STATUS.SUCCESS){
            membershipData = data.resData;
        }
    }catch(e){
        return handleUnauthorized(e,context.res);
    }
    return getServerProps(context,{membershipData,queryParams},"MEMBERSHIPS:LIST");
}
export default Memberships;