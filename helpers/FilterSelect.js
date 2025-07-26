import React,{useRef,useState,useEffect,useCallback,useMemo} from "react";
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
            cursor:pointer;position:absolute;top:50%;right:8px;-webkit-transform:translateY(-50%);transform:translateY(-50%);font-size:16px;line-height:1;color:rgba(0,0,0,0.5);vertical-align:middle;
            &.cross{right:30px;}
        }
    }
    & .list-group-wrapper{
        position:relative;display:none;
        &.active{display:block;}
        & .list-group{
            overflow:auto;position:absolute;max-height:140px;border:1px solid ${colors.BORDER};border-radius:6px;z-index:990;width:100%;background-color:${colors.WHITE};list-style:none;margin:0;padding:0;
            & .list-group-item{
                padding:3px 10px 3px 15px;border:none;cursor:pointer;font-weight:400;font-size:14px;display:flex;align-items:center;position:relative;word-break:break-word;white-space:pre-wrap;
                &.static-option{background:transparent;font-weight:500;}
                &.selected-clr,
                &:hover{color:${colors.WHITE};background:${colors.PRIMARY};}
            }
        }
    }
    .loading{text-align:center;position:absolute;color:${colors.WHITE};z-index:990;background:black;padding:8px 18px;border-radius:5px;left:calc(50% - 45px);top:calc(50% - 18px);}
`;
const FilterSelect = ({data = [],selected = {},hasValidateError = false,isCustom = false,disabled = false,hasMore = true,multiple = false,label = "",name = "",inputClasses = "",handleChange,handleSelect = () => {},handleSelectData = () => {},handleRemove}) => {
    const componentRef = useRef(null);
    const [nextItem,setNextItem] = useState(1);
    const [open,setOpen] = useState(false);
    const [loading,setLoading] = useState(false);
    const [search,setSearch] = useState("");
    const [options,setOptions] = useState(data);
    useEffect(() => {
        initLoadData({refresh : true});
        document.addEventListener("click",handleClickOutside,true);
    },[]);
    useEffect(() => {
        if(selected && selected.name){
            setSearch(selected.name);
        }else{
            setSearch("");
        }
    },[selected]);
    // Check event click outside of element
    const handleClickOutside = (event) => {
        if(componentRef.current && !componentRef.current.contains(event.target)){
            setOpen(false);
        }
    }
    // only gets called once render
    const initLoadData = (data) => {
        const refresh = data && data.refresh ? data.refresh : false
        if(!isCustom && !multiple){
            handleChange({pageNo: 1,search: "",refresh: refresh,callback: (res) => {
                setLoading(false);
                setNextItem(1);
                setOptions([...res.data]);
            }});
        }
    }
    // only gets called when user select option
    const handleValues = async(i,key) => {
        if(key == 0){
            return;
        }
        setSearch(data[i].name);
        setOpen(false);
        handleSelect(i);
        handleSelectData(data[i]);
    }
    // only gets called once after first render
    const sendQuery = useCallback((value) => {
        searchData(value);
    },[]);
    // only gets called when sendQuery changes
    const debouncedSendQuery = useMemo(() => {
        return debounce(sendQuery,500);
    },[sendQuery]);
    // only gets called when user search
    const handleChangeSearch = (e) => {
        const {value} = e.target;
        setSearch(value);
        debouncedSendQuery(value);
    }
    const clearSearch= () => {
        if(!isCustom){
            setSearch("");
            handleRemove(selected);
            handleChange({pageNo: 1,search: "",refresh: true,callback: (res) => {
                setLoading(false);
                setNextItem(1);
                setOptions([...res.data]);
                const listElm = document.querySelector("#search-input-" + name);
                if(listElm){
                    listElm.focus();
                }
            }});
        }else{
            setSearch("");
            handleRemove(selected);
        }
    }
    // only gets called when user scrolled to next page
    const loadMore = async() => {
        let searchText = search;
        if(!isCustom && !loading && hasMore){
            let nextPage = nextItem + 1;
            if(selected.name){
                searchText = "";
            }
            setLoading(true);
            handleChange({pageNo: nextPage,search: searchText,refresh: false,callback: (res) => {
                setLoading(false);
                setNextItem(nextPage);
                setOptions([...res.data]);
            }});
        }
    }
    // get data with searched text
    const searchData = async(value) => {
        if(!isCustom){
            setOpen(true);
            setLoading(true);
            setSearch(value);
            handleChange({pageNo: 1,search: value,refresh: true,callback: (res) => {
                setLoading(false);
                setNextItem(1);
                setOptions([...res.data]);
            }})
        }
    }
    // Check next page data is trigger
    const handleScroll = (event) => {
        if(Math.round(event.target.scrollTop + event.target.clientHeight + 400) >= event.target.scrollHeight){
            loadMore();
        }
    }
    // for show/hide dropdown lists
    const handleToggle = () => {
        if(!open){
            setOpen(true);
            const listElm = document.querySelector(`#search-input-${name}`);
            if(listElm){
                listElm.focus();
            }
        }else{
            setOpen(false);
        }
    }
    // for show dropdown lists
    const handleOpen = () => {
        setOpen(true);
        if(!isCustom){
            const listElm = document.querySelector(`#search-input-${name}`);
            if(listElm){
                listElm.focus();
            }
        }
    }
    return (
        <Wrapper ref={componentRef} className="pl-filter-select">
            <div className={`main-input-search`}>
                <input type="text" className={`form-control ${inputClasses} search-input-${name} ${(isCustom ? "cursor-pointer" : "")} ${hasValidateError ? "has-input-error" : ""}`} id={`search-input-${name}`} disabled={disabled} onInput={handleChangeSearch} onFocus={handleOpen} name={name} readOnly={isCustom} placeholder={label} value={search} autoComplete="off"/>
                {selected && selected.name && !disabled && (
                    <div className="search-icon cross" onClick={clearSearch}>{crossIcon({width:16,height:16})}</div>
                )}
                {!disabled && (
                    <div className="search-icon" onClick={handleToggle}>{dropdownIcon({width:24,height:24})}</div>
                )}
            </div>
            {!disabled && (
                <div className={`list-group-wrapper ${open ? "active" : ""}`}>
                    <ul className={`list-group list-group-${name}`} id={`infinite-list-${name}`} onScroll={handleScroll}>
                        {!data.length ? (
                            <li className="list-group-item cursor-default">No Data Found</li>
                        ) : options.map((item,index) => (
                            <li key={index} onClick={() => handleValues(index,item.id)} className={`list-group-item ${((item.id == selected.id) ? " selected-clr" : "")} ${item.isStatic ? "static-option" : ""}`}>{item.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Wrapper>
    );
}
export default FilterSelect;