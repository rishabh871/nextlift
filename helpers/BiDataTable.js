import React from "react";
import styled from "styled-components";
import colors from "@constants/Colors";
import {loaderIcon,crossIcon,searchIcon,previousIcon,nextIcon} from "@helpers/Icons";
import {usePagination} from "@helpers/Frontend";
const Wrapper = styled.div`
    width:100%;position:relative;display:flex;flex-direction:column;row-gap:20px;
    & .rt-datatable-header{
        display:flex;align-items:center;column-gap:15px;row-gap:15px;flex-wrap:wrap;
        & .rt-datatable-length{width:75px;font-size:15px;height:40px;color:${colors.WHITE};background-color:${colors.SECONDARY};border:1px solid ${colors.BLACK};}
        & .rt-datatable-search{
            display:flex;position:relative;margin-left:auto;
            & .search-icon{fill:${colors.WHITE};position:absolute;top:9px;left:9px;}
            & input{height:40px;padding:7px 40px 7px 35px;font-size:16px;margin:0;font-weight:400;line-height:1.5;color:${colors.WHITE};background-color:${colors.SECONDARY};background-clip:padding-box;border:1px solid ${colors.BLACK};-webkit-appearance:none;-moz-appearance:none;appearance:none;border-radius:2px;transition:border-color 0.15s ease-in-out,box-shadow 0.15s ease-in-out;}
            & .btn{
                position:absolute;right:0;padding:0;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;
                & svg{fill:${colors.WHITE};}
            }
        }
    }
    & .rt-datatable-wrap{
        overflow:auto;
        &::-webkit-scrollbar{width:5px;height:8px;}
        &::-webkit-scrollbar-track{box-shadow:inset 0 0 1px grey;border-radius:5px;}
        &::-webkit-scrollbar-thumb{background:#bababa;border-radius:5px;}
        &::-webkit-scrollbar-thumb:hover{background:grey;}
        & .rt-datatable{
            width:100%;border-collapse:collapse;
            & thead{
                display:table-header-group;vertical-align:middle;background:${colors.RED};
                & th{
                    padding:13px 15px;vertical-align:middle;font-size:14px;font-weight:600;white-space:nowrap;text-align:left;color:${colors.WHITE};box-sizing:border-box;background:${colors.RED};
                    &:first-child{border-top-left-radius:6px;}
                    &:last-child{border-top-right-radius:6px;}
                    &.w100{width:100px;}
                    &.w350{width:350px;}
                    &.w450{width:450px;}
                    &.w500px{width:500px;}
                    &.text-center{text-align:center;}
                    &.sorting{cursor:pointer;}
                    & .sort-wrap{
                        display:inline-block;margin-right:6px;
                        & .sort-asc{
                            width:0px;height:0px;margin-bottom:1px;border-bottom:5px solid #c1c1c1;border-left:5px solid transparent;border-right:5px solid transparent;
                            &.active{border-bottom:5px solid ${colors.WHITE};}
                        }
                        & .sort-desc{
                            width:0px;height:0px;margin-top:1px;border-top:5px solid #c1c1c1;border-left:5px solid transparent;border-right:5px solid transparent;
                            &.active{border-top:5px solid ${colors.WHITE};}
                        }
                    }
                }
            }
            & tbody{
                border:1px solid ${colors.BLACK};border-top:none;
                & tr{
                    background:${colors.SECONDARY};
                    &:nth-child(even){background:${colors.PRIMARY};}
                }
                & td{
                    padding:10px 15px;vertical-align:middle;font-size:14px;font-weight:400;white-space:nowrap;color:${colors.WHITE};box-sizing:border-box;
                    &.w100{width:100px;}
                    &.w350{width:350px;}
                    &.w450{width:450px;}
                    &.w500px{width:500px;}
                    &.text-center{text-align:center;}
                    &.text-capitalize{text-transform:capitalize;}
                    &.bottom-align{vertical-align:bottom;}
                    & .rt-datatable-loading{
                        display:flex;align-items:center;column-gap:15px;
                        & svg{stroke:${colors.WHITE};}
                    }
                    & .rt-bulk-checkboxs{width:18px;height:18px;margin:0;}
                    & .link{
                        text-decoration:none;color:${colors.WHITE};
                        &:hover{color:${colors.RED};}
                    }
                    & .td-content{
                        white-space:inherit;overflow:hidden;text-overflow:ellipsis;cursor:pointer;max-width:180px;
                        &.show{white-space:normal;overflow:hidden;text-overflow:ellipsis;word-break:break-word;height:auto;}
                        &.text-capitalize{text-transform:capitalize;}
                    }
                    & .no-gap{column-gap:0px;}
                    & .rt-datatable-actions{
                        display:flex;justify-content:flex-end;gap:8px;
                        & .box-button{
                            display:flex;align-items:center;justify-content:center;width:35px;height:35px;border:1px solid ${colors.BLACK};background:transparent;border-radius:5px;fill:${colors.WHITE};cursor:pointer;
                            &:hover{background:${colors.RED};fill:${colors.WHITE};border-color:${colors.RED};}
                            &:disabled{background:${colors.BLACK};fill:${colors.WHITE};opacity:0.6;}
                        }
                        & .rt-btn{display:flex;align-items:center;justify-content:center;border:none;border-radius:5px;color:${colors.WHITE};cursor:pointer;background:${colors.RED};padding:0 10px;height:35px;margin-right:5px;font-size:14px;}
                    }
                }
            }
        }
    }
    & .rt-datatable-footer{
        display:flex;align-items:center;column-gap:20px;row-gap:20px;flex-wrap:wrap;justify-content:space-between;
        & .rt-datatable-showing-text{color:${colors.WHITE};}
        & .rt-datatable-pagination{
            display:flex;margin:0;padding:0;list-style:none;column-gap:10px;
            & .page-item{
                box-sizing:border-box;
                & button{
                    padding:0 10px;color:${colors.WHITE};background:${colors.SECONDARY};border:1px solid ${colors.BORDER};display:flex;height:35px;min-width:35px;align-items:center;justify-content:center;font-size:14px;cursor:pointer;border-radius:2px;column-gap:5px;
                    & svg{stroke:${colors.WHITE};}
                    &:disabled{
                        pointer-events:none;background:${colors.SECONDARY};opacity:0.2;color:${colors.WHITE};
                        & svg{stroke:${colors.WHITE};}
                    }
                    &.active,
                    &:hover{
                        z-index:3;color:${colors.WHITE};background:${colors.RED};border-color:${colors.RED};
                        & svg{stroke:${colors.WHITE};}
                    }
                }
            }
        }
    }
    @media(max-width:991px){
        & .rt-datatable-footer{
            & .rt-datatable-pagination{
                & .page-item{
                    & button{
                        & span{display:none;}
                    }
                }
            }
        }
    }
    @media(max-width:767px){
        & .rt-datatable-footer{
            & .rt-datatable-pagination{
                column-gap:5px;
                & .page-item{
                    & button{padding:0 8px;height:30px;min-width:30px;}
                }
            }
        }
    }
    @media(max-width:479px){
        & .rt-datatable-header{
            & .rt-datatable-search{
                width:calc(100% - 90px);
            }
        }
    }
`;
const BiDataTable = ({tableData,columns = [],isLoading = false,filters = {limit: 100},perPage = [50,100,200],showHeader = true,showFooter = true,showPerPage = true,showSearch = true,bulkIds = [],searchValue = "",searchText = () => {},resetSearch = () => {},sortBy = () => {},updateBulkIds = () => {},paginationHandler = () => {},perPageHandler = () => {}}) => {
    const paginationRanges = usePagination({currentPage: tableData.current,totalCount: tableData.totalData,siblingCount: 0,pageSize: filters.limit});
    return (
        <Wrapper>
            {showHeader ? (
                <div className="rt-datatable-header">
                    {showPerPage ? (
                        <select className="rt-datatable-length rt-cust-select" name="length" onChange={perPageHandler} value={filters.limit}>
                            {perPage.length > 0 && perPage.map((page,index) => (
                                <option key={index} value={page}>{page}</option>
                            ))}
                        </select>
                    ) : null}
                    {showSearch ? (
                        <div className="rt-datatable-search">
                            {searchIcon({width:22,height:20,className:"search-icon"})}
                            <input type="text" placeholder="Search" onChange={searchText} value={searchValue} autoComplete="off"/>
                            {searchValue && searchValue.length > 0 && (
                                <button type="button" className="btn btn-clear" onClick={resetSearch}>{crossIcon({width:20,height:20})}</button>
                            )}
                        </div>
                    ) : null}
                </div>
            ) : null}
            <div className="rt-datatable-wrap">
                <table className="rt-datatable">
                    <thead className="rt-datatable-head">
                        <tr className="rt-datatable-tr">
                            {columns && columns.length > 0 && columns.map((column,index) => (
                                <th className={`rt-datatable-th ${(column.orderable ? "sorting" : "")} ${column.classes ? column.classes.join(" ") : ""}`} key={index} onClick={() => sortBy(column)}>
                                    {column.orderable && (
                                        <div className="sort-wrap">
                                            <div className={`sort-asc ${(column.name == filters.column && filters.dir.toLowerCase() == "asc") ? "active" : ""}`}></div>
                                            <div className={`sort-desc ${(column.name == filters.column && filters.dir.toLowerCase() == "desc") ? "active" : ""}`}></div>
                                        </div>
                                    )}
                                    <span>{column.label}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="rt-datatable-body">
                        {isLoading && (
                            <tr className="rt-datatable-tr">
                                <td className="rt-datatable-td" colSpan={columns.length}>
                                    <div className="rt-datatable-loading" colSpan={columns.length}>
                                        {loaderIcon({width:30,height:30,stroke:colors.BLACK})}
                                        <span>Loading</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && (!tableData || !tableData.data || !tableData.data.length) && (
                            <tr className="rt-datatable-tr">
                                <td className="rt-datatable-td" colSpan={columns.length}>No record found.</td>
                            </tr>
                        )}
                        {!isLoading && tableData && tableData.data && tableData.data.length > 0 && tableData.data.map((row,key) => (
                            <tr className="rt-datatable-tr" key={key}>
                                {columns && columns.length > 0 && columns.map((column,index) => (
                                    <td className={`rt-datatable-td ${column.classes ? column.classes.join(" ") : ""}`} key={index}>
                                        {column.name == "checkbox" ? (
                                            <input type="checkbox" className="rt-bulk-checkboxs" value={row.id} checked={bulkIds.includes(row.id)} onChange={updateBulkIds}/>
                                        ) : column.component ? (
                                            <>{column.component(row,key,column.name)}</>
                                        ) : (column.currencyFormat == true) ? (
                                            <>{row[column.name] ? Number(row[column.name]).toLocaleString("en-US",{style: "currency",currency: "USD",maximumFractionDigits: 0,minimumFractionDigits: 0}) : null}</>
                                        ) : (column.currencyDotFormat == true) ? (
                                            <>{row[column.name] ? Number(row[column.name]).toLocaleString("en-US",{style: "currency",currency: "USD",minimumFractionDigits: 2,maximumFractionDigits: 2}) : null}</>
                                        ) : (column.numPercentFormat == true) ? (
                                            <>{row[column.name] ? Number(row[column.name]).toLocaleString("en-US",{minimumFractionDigits: 2,maximumFractionDigits: 2}) + '%' : null}</>
                                        ) : (column.numFormat == true) ? (
                                            <>{row[column.name] ? Number(row[column.name]).toLocaleString("en-US",{minimumFractionDigits: 0,maximumFractionDigits: 0}) : null}</>
                                        ) : (column.numDotFormat == true) ? (
                                            <>{row[column.name] ? Number(row[column.name]).toLocaleString("en-US",{minimumFractionDigits: 2,maximumFractionDigits: 2}) : null}</>
                                        ) : (
                                            <>{row[column.name]}</>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!isLoading && showFooter && tableData && tableData.data && tableData.data.length > 0 ? (
                <div className="rt-datatable-footer">
                    <div className="rt-datatable-showing-text">Total: <span>{tableData.totalData}</span> record(s)</div>
                    <ul className="rt-datatable-pagination">
                        <li className="page-item">
                            <button className="button" type="button" onClick={() => paginationHandler(tableData.current - 1)} disabled={(tableData.current == 1)}>{previousIcon({width:20,height:20})}</button>
                        </li>
                        {paginationRanges.map((page,index) => (
                            <li key={index} className="page-item">
                                {page === "" ? (
                                    <button type="button">...</button>
                                ) : (
                                    <button className={`${(page == tableData.current) ? "active" : ""}`} type="button" onClick={() => paginationHandler(page)}>{page}</button>
                                )}
                            </li>
                        ))}
                        <li className="page-item">
                            <button type="button" onClick={() => paginationHandler(tableData.current + 1)} disabled={(tableData.totalPages == tableData.current)}>{nextIcon({width:20,height:20})}</button>
                        </li>
                    </ul>
                </div>
            ) : null}
        </Wrapper>
    );
}
export default BiDataTable;