import React,{useEffect,useState} from "react"
import Cookies from "js-cookie";
import Header from "@components/Layouts/Header";
import Footer from "@components/Layouts/Footer";
import {APP_SLUG} from "@constants/Common";
const Frontend = (props) => {
    const currentUser = Cookies.get(`${APP_SLUG}-user`) ? JSON.parse(Cookies.get(`${APP_SLUG}-user`)) : null;
    const [isLoad,setIsLoad] = useState(false);
    useEffect(() => {
        setIsLoad(true);
    },[]);
    return (
        <React.Fragment>
            {isLoad ? (
                <>
                    <Header currentUser={currentUser} page={props.page}/>
                    <div className="rt-content">{props.children}</div>
                    <Footer/>
                </>
            ) : null}
        </React.Fragment>
    );
}
export default Frontend;