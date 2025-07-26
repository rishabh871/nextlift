import React,{useRef,useState,useEffect,useCallback,useMemo} from "react";
import Cookies from "js-cookie";
import styled from "styled-components";
import colors from "@constants/Colors";
import {dropdownIcon,crossIcon} from "@helpers/Icons";
import debounce from "lodash/debounce";
const Wrapper = styled.div`
    width:100%; 
    & .main-input-search{
        position:relative;
        & input{padding-right:50px;}
        & .search-icon{
            cursor:pointer;position:absolute;top:50%;right:8px;transform:translateY(-50%);font-size:18px;line-height:1;color:rgba(0,0,0,0.5);vertical-align:middle; 
            &.cross{right:35px;height:16px;}
        }
    }
    & .list-group-wrapper{
        position:relative;display:none;
        &.active{display:block;}
        & .list-group{
            overflow:auto;position:absolute;max-height:140px;border:1px solid ${colors.BORDER};border-radius:2px;z-index:990;width:100%;background-color:${colors.WHITE};list-style:none;margin:0;padding:0;
            & .list-group-item{
                padding:5px 10px 5px 10px;border:none;cursor:pointer;font-weight:400;font-size:14px;line-height:1.2;display:flex;gap:7px;position:relative;word-break:break-all;
                & input{width:15px;height:15px;margin:0 4px;flex:0 0 15px;}
                &:last-child{border:none;}
            }
        }
    }
    .loading{text-align:center;position:absolute;color:${colors.WHITE};z-index:990;background:black;padding:8px 18px;border-radius:5px;left:calc(50% - 45px);top:calc(50% - 18px);}
`;
const MultiSelect = ({data = [],selected = [],isCustom = false,disabled = false,hasMore = true,text = "",label = "",name = "",inputClasses = "",handleChange,handleSelect,handleRemove,selectSort = true,selectReset = false,reloadEveryTime = false,hasValidateError = false,defaultFilterData}) => {
    const componentRef = useRef(null);
    const [nextItem,setNextItem] = useState(1);
    const [open,setOpen] = useState(false);
    const [loading,setLoading] = useState(false);
    const [search,setSearch] = useState("");
    const [options,setOptions] = useState(data);
    const [clearItems,setClearItems] = useState(false);
    useEffect(() => {
        initLoadData({refresh: true});
        setClearItems(false);
        handleLSEvent(0)
        document.addEventListener("click",handleClickOutside,true);
    },[]);
    useEffect(() => {
        handleTitle();
    },[selected]);
    /**
     * handle local storage for click outside and ignore multi api calls
     * @param {*} type 
     */
    const handleLSEvent = (type) => {
        Cookies.set(`outside-click-${name}`,type)
    }
    // Check event click outside of element
    const handleClickOutside = (event) => {
        if(componentRef.current && !componentRef.current.contains(event.target)){
            const outsideCLick = Cookies.get(`outside-click-${name}`,true)
            if(outsideCLick == 0){
                handleLSEvent(1)
                searchData("",false);
            }
            setOpen(false);
        }
    }
    // For managing dropdown title
    const handleTitle = (type) => {
        let title = "";
        if(type == "clearTitle"){
            text = "";
            title = "";
        }else{
            if(selected.length == 1){
                title = selected[0].name;
            }else if(text && selected.length > 1){
                title = text;
            }else if(selected.length > 1 && !text){
                title = "Multiple";
            }
        }
        setSearch(title);
    }
    // only gets called once render
    const initLoadData = (data) => {
        const refresh = data && data.refresh ? data.refresh : false;
        if(!isCustom){
            handleChange({
                pageNo: 1,search: "",refresh: refresh,defaultFilterData: defaultFilterData,callback: (res) => {
                    setLoading(false);
                    setNextItem(1);
                    setOptions([...res.data]);
                }
            });
        }
    }
    // only gets called when user select option
    const handleValues = async(i,key) => {
        if(key == 0){
            return;
        }
        handleSelect(i);
        if(selectReset){
            setTimeout(() => {
                setSearch("")
                searchData("");
            },300)
        }
    }
    // only gets called once after first render
    const sendQuery = useCallback((value,defaultFilterData) => {
        searchData(value,defaultFilterData);
    },[]);
    // only gets called when sendQuery changes
    const debouncedSendQuery = useMemo(() => {
        return debounce(sendQuery,500);
    },[sendQuery]);
    // only gets called when user search
    const handleChangeSearch = (e) => {
        const {value} = e.target;
        setSearch(value);
        debouncedSendQuery(value,defaultFilterData);
    }
    // only gets called when user clear selected options
    const clearSearch = () => {
        if(!disabled){
            if(!isCustom){
                setSearch("");
                handleTitle("clearTitle");
                setClearItems(true);
                document.querySelector(`#search-input-${name}`).scrollTo(0,0);
                handleChange({pageNo: 1,search: "",refresh: true,remove: true,defaultFilterData: defaultFilterData,callback: (res) => {
                    setLoading(false);
                    setNextItem(1);
                    setOptions([...res.data]);
                }});
            }else{
                setSearch("");
                handleTitle("clearTitle");
                handleRemove();
                document.querySelector(`#search-input-${name}`).focus();
            }
        }
    }
    // only gets called when user scrolled to next page
    const loadMore = async () => {
        let searchText = search;
        if(!isCustom && !loading && hasMore && !clearItems){
            let nextPage = nextItem + 1;
            setLoading(true);
            handleChange({
                pageNo: nextPage,search: searchText,refresh: false,defaultFilterData: defaultFilterData,callback: (res) => {
                    setLoading(false);
                    setNextItem(nextPage);
                    setOptions([...res.data]);
                }
            });
        }
        if (clearItems) {
            setClearItems(false);
        }
    }
    // get data with searched text
    const searchData = async(value,cleared = true,defaultFilterData) => {
        if(!isCustom){
            setOpen(true);
            setLoading(true);
            if(cleared){
                setSearch(value);
            }
            if(!value && cleared){
                handleTitle("clearTitle");
            }
            handleChange({
                pageNo: 1,search: value,refresh: true,defaultFilterData: defaultFilterData,callback: (res) => {
                    setLoading(false);
                    setNextItem(1);
                    setOptions([...res.data]);
                }
            });
        }
    }
    // Check next page data is trigger
    const handleScroll = (event) => {
        if(Math.round(event.target.scrollTop + event.target.clientHeight + 300) >= event.target.scrollHeight){
            loadMore();
        }
    }
    // for show/hide dropdown lists
    const handleToggle = () => {
        if(!open){
            setOpen(true);
            handleLSEvent(0)
            const listElm = document.querySelector(`#search-input-${name}`);
            listElm.focus();
        }else{
            setOpen(false);
        }
    }
    // for show dropdown lists
    const handleOpen = () => {
        setOpen(true);
        handleLSEvent(0)
        if(!isCustom){
            const listElm = document.querySelector(`#search-input-${name}`);
            listElm.focus();
            if(reloadEveryTime){
                initLoadData({refresh: true});
            }
        }
    }
    let outputData = [];
    const selectedIds = selected.map((v) => v.id);
    const removeSelected = [];
    options.map((opt) => {
        if(!selectedIds.includes(opt.id)){
            removeSelected.push(opt);
        }
    });
    if(selectSort){
        outputData = [...selected,...removeSelected];
    }else{
        outputData = [...options];
    }
    return (
        <Wrapper ref={componentRef} className="pl-filter-select">
            <div className={`main-input-search`}>
                <input
                    type="text"
                    className={`form-control ${inputClasses} search-input-${name}${isCustom ? " cursor-pointer" : ""}${(search == "Multiple" ? " dark-placeholder" : "")}${hasValidateError ? " has-input-error" : ""}`}
                    id={`search-input-${name}`}
                    disabled={disabled}
                    onInput={handleChangeSearch}
                    onFocus={handleOpen}
                    name={name}
                    readOnly={isCustom}
                    placeholder={search == "Multiple" ? search : label}
                    value={search != "Multiple" ? search : ""}
                    autoComplete="off"
                />
                {(search && !disabled) && (
                    <div className="search-icon cross" onClick={clearSearch}>{crossIcon({width:16,height:16})}</div>
                )}
                {!disabled && (
                    <div className="search-icon" onClick={handleToggle}>{dropdownIcon({width:30,height:30})}</div>
                )}
            </div>
            {!disabled && (
                <div className={`list-group-wrapper ${open ? "active" : ""}`}>
                    <ul className={`list-group list-group-${name}`} id={`infinite-list-${name}`} onScroll={handleScroll}>
                        {!loading && outputData.length == 0 ? (
                            <li className="list-group-item cursor-default">No data found</li>
                        ) : (outputData.map((item,index) => (
                            <li key={index} onClick={() => handleValues(index,item.id)} className="list-group-item">
                                <input type="checkbox" checked={selectedIds.includes(item.id)} readOnly />
                                <span>{item.name} {item.email ? <>({item.email})</> : null}</span>
                            </li>
                        )))}
                    </ul>
                </div>
            )}
        </Wrapper>
    );
};
export default MultiSelect;