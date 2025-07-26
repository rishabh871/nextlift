import {API_STATUS,BASE_URL} from "@constants/Common";
import {useMemo} from "react";
import moment from "moment";
const range = (start,end) => {
    let length = end - start + 1;
    return Array.from({length},(_,idx) => idx + start);
}
export const DOTS = "";
export const limitText = (text,limit = 500) => {
    let newText = text;
    if(text && text.length >= limit){
        newText = text.substring(0,limit);
    }
    return newText;
}
export const remaingLimit = (text,limit = 500) => {
    let count = (limit - (text ? text.replace(/\r/g,"").length : 0));
    count = count > 0 ? count : 0;
    return count + " " + ((count > 1) ? "characters left" : "character left");
}
export const textLimit = (text,limit = 20) => {
    let newText = text;
    if(text.length > limit){
        newText = text.substring(0,18) + "..." + text.substring(text.length - 3);
    }
    return newText;
}
export const focusOnFeild = (name) => {
    if(document.getElementsByName(name)){
        let textbox = document.getElementsByName(name)[0];
        if(textbox){
            textbox.focus();
        }
    }
}
export const focusOnFeildUsingClassName = (name) => {
    if(document.getElementsByClassName(name)){
        let textbox = document.getElementsByClassName(name)[0];
        if(textbox){
            textbox.scrollIntoView();
        }
    }
}
export function hasValidationError(errors,field){
    if(errors.hasOwnProperty(field)){
        return errors[field] ? true : false;
    }
    return null;
}
export function validationError(errors,field){
    if(errors.hasOwnProperty(field)){
        if(!Array.isArray(errors[field])){
            return errors[field];
        }else{
            return errors[field].toString();
        }
    }
    return null;
}
export const handleUnauthorized = (e,response) => {
    if(e){
        if(e.response.data.status === API_STATUS.UNAUTHORIZED){
            response.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/login`});
            response.end();
        }else if(e.response.data.status === API_STATUS.TOO_MANY_REQUESTS){
            response.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/many-request`});
            response.end();
        }else{
            response.writeHead(API_STATUS.FOUND,{location: BASE_URL});
            response.end();
        }
    }else{
        response.writeHead(API_STATUS.FOUND,{location: BASE_URL});
        response.end();
    }
    return {props: {}};
}
export const handleForbidden = (response) => {
    response.writeHead(API_STATUS.FOUND,{location: `${BASE_URL}/forbidden`});
    response.end();
    return {props: {}};
}
export function checkRolesCode(codes,currentRoleCode){
    if(codes && codes.length && codes.includes(currentRoleCode)){
        return true;
    }
    return false;
}
export const usePagination = ({totalCount,pageSize,siblingCount = 1,currentPage}) => {
    const paginationRange = useMemo(() => {
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const totalPageNumbers = siblingCount + 5;
        if(totalPageNumbers >= totalPageCount){
            return range(1, totalPageCount);
        }
        const leftSiblingIndex = Math.max(currentPage - siblingCount,1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount,totalPageCount);
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;
        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;
        if(!shouldShowLeftDots && shouldShowRightDots){
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1,leftItemCount);
            return [...leftRange,DOTS,totalPageCount];
        }
        if(shouldShowLeftDots && !shouldShowRightDots){
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPageCount - rightItemCount + 1,totalPageCount);
            return [firstPageIndex,DOTS,...rightRange];
        }
        if(shouldShowLeftDots && shouldShowRightDots){
            let middleRange = range(leftSiblingIndex,rightSiblingIndex);
            return [firstPageIndex,DOTS,...middleRange,DOTS,lastPageIndex];
        }
    },[totalCount,pageSize,siblingCount,currentPage]);
    return paginationRange;
}
export function dateWithFormat(dateTime,format){
    if(!dateTime){
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }
    let newFormat = "MMMM Do YYYY";
    if(format){
        newFormat = format;
    }
    let dateTimeConverted = moment(dateTime).format(newFormat).replace(/-/g,"/");
    return dateTimeConverted;
}
export function dateWithFormatWithLocal(dateTime,format){
    if(!dateTime){
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }
    let newFormat = "MMMM Do YYYY";
    if(format){
        newFormat = format;
    }
    let dateTimeConverted = moment.utc(dateTime).local().format(newFormat).replace(/-/g,"/");
    return dateTimeConverted;
}
export function cleanHtml(html){
    var newText = html.replace(/(<(pre|script|style|textarea)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g, "$1$3")
    var slicer;
    while(newText.slice(-7) === '<p></p>' || newText.slice(-11) === '<p><br></p>'){
        if(newText.slice(-7) === '<p></p>'){
            slicer = 7;
        }else{
            slicer = 11;
        }
        newText = newText.substring(0,newText.length - slicer)
    }
    newText = newText.replaceAll('<li></li>','').replaceAll('<li><br></li>','');
    return newText;
}