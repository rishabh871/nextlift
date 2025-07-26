import React,{useEffect,useState} from "react"
import styled from "styled-components";
import Cookies from "js-cookie";
import colors from "@constants/Colors";
import Navbar from "@components/Layouts/Navbar";
import Sidebar from "@components/Layouts/Sidebar";
import {APP_SLUG} from "@constants/Common";
const Wrapper = styled.div`
    background:${colors.PRIMARY};display:flex;height:100vh;max-height:100%;position:relative;
    & .layout-content-wrap{
        box-sizing:border-box;display:flex;flex-direction:column;width:calc(100% - 70px);
        &.overlay-menu{width:calc(100% - 240px);}
        & .layout-content{
            box-sizing:border-box;padding:25px;width:100%;overflow-y:auto;
        }
    }
`;
const Backend = (props) => {
    const [isLoad,setIsLoad] = useState(false);
    const [isShowSidebar,setIsShowSidebar] = useState(true);
    const currentUser = Cookies.get(`${APP_SLUG}-user`) ? JSON.parse(Cookies.get(`${APP_SLUG}-user`)) : null;
    useEffect(() => {
        setIsLoad(true);
        if(!document.body.classList.contains("backend")){
            document.body.classList.add("backend");
        }
    },[]);
    const toggleSidebar = () => {
        setIsShowSidebar(!isShowSidebar);
    }
    return (
        <React.Fragment>
            {isLoad ? (
                <Wrapper>
                    {/* {isShowSidebar && (
                        <div className="overlay" onClick={toggleSidebar}/>
                    )} */}
                    <Sidebar page={props.page} currentUser={currentUser} isShowSidebar={isShowSidebar} toggleSidebar={toggleSidebar}/>
                    <div className={`layout-content-wrap ${isShowSidebar ? "overlay-menu" : ""}`}>
                        <Navbar currentUser={currentUser} toggleSidebar={toggleSidebar}/>
                        <div className="layout-content">{props.children}</div>
                    </div>
                </Wrapper>
            ) : null}
        </React.Fragment>
    );
}
export default Backend;