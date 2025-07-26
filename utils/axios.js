import axios from "axios";
import {API_STATUS,APP_SLUG,BASE_URL} from "@constants/Common";
import Cookies from "js-cookie";
import momentTimezone from "moment-timezone";

const intance = axios.create({baseURL:BASE_URL});
intance.interceptors.request.use((request) => {
    const token = Cookies.get(`${APP_SLUG}-token`);
    if(token){
        request.headers.authorization = `${token}`;
    }
    request.headers.tz = momentTimezone.tz.guess();
    return request;
},(error) => {
    return Promise.reject(error);
});
intance.interceptors.response.use((response) => {
    if(response.data.status == API_STATUS.FORBIDDEN){
        window.location.href = "/forbidden";
        return;
    }
    return Promise.resolve(response);
},async(error) => {
    if(error.response.data.status === 401){
        Cookies.remove(`${APP_SLUG}-token`);
        Cookies.remove(`${APP_SLUG}-user`);
        if(window.location.pathname !== "/"){
            window.location.href = "/";
        }else{
            window.location.reload();
        }
        return Promise.reject(error);
    }else{
        return Promise.reject(error);
    }
});
export default intance;