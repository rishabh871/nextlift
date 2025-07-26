import React,{useEffect,useState,useMemo,useCallback} from "react";
import Head from "next/head";
import debounce from "lodash/debounce";
import styled from "styled-components";
import axios from "@utils/axios";
import {API_STATUS,APP_NAME,PER_PAGE} from "@constants/Common";
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
import BiDataTable from "@helpers/BiDataTable";
import {TRANSACTIONS} from "@constants/ApiConstant";
import colors from "@constants/Colors";
import CustomHeading from "@components/styled/Heading";
const Wrapper = styled.div`
    display:flex;flex-direction:column;row-gap:30px;
`;
const Transactions = () => {
    const [tableData,setTableData] = useState({data: [],current: 1,totalPages: 1});
    const [filters,setFilters] = useState({page:1,limit:10,column:"id",dir:"DESC",query:""});
    const [sortOrders,setSortOrders] = useState({});
    const [isLoading,setIsLoading] = useState(true);
    const [searchValue,setSearchValue] = useState("");
    const sortColumns = ["membership_name","user_name","phone","email","street","state_name","city_name","zip","status"];
    useEffect(() => {
        window.scrollTo(0,0);
        updateSortOrder();
        getData(filters);
    },[]);
    const columns = [
        {label:"Membership",name:"membership_name",orderable:true},
        {label:"User Name",name:"user_name",orderable:true},
        {label:"Phone",name:"phone",orderable:true},
        {label:"Email",name:"email",orderable:true},
        {label:"Street",name:"street",orderable:true},
        {label:"State",name:"state_name",orderable:true},
        {label:"City",name:"city_name",orderable:true},
        {label:"Zipcode",name:"zip",orderable:true},
        {label:"Status",name:"status",orderable:true}
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
            const {data} = await axios.get(TRANSACTIONS.LISTS,{params: appliedFilters});
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
    return (
        <React.Fragment>
            <Head>
                <title>{`Transactions - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="transactions">
                <Wrapper>
                    <CustomHeading>Transactions</CustomHeading>
                    <BiDataTable tableData={tableData} columns={columns} isLoading={isLoading} filters={filters} perPage={PER_PAGE} showSearch={true} searchValue={searchValue} searchText={searchText} resetSearch={resetSearch} sortBy={sortBy} paginationHandler={paginationHandler} perPageHandler={perPageHandler}/>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    return getServerProps(context,{},"TRANSACTIONS:LIST");
}
export default Transactions;