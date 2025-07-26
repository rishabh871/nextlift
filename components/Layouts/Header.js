import React,{useEffect,useState} from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import sweetAlertHelper from "@helpers/SweetAlert";
import {APP_NAME,BASE_URL,APP_SLUG,ROLES,WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
import hasPermissions from "@helpers/UserRoles";
import {checkRolesCode} from "@helpers/Frontend";
import {dashboardIcon,profileIcon,changePasswordIcon,logoutIcon,menuIcon,crossIcon} from "@helpers/Icons";
const Wrap = styled.div`
    width:100%;box-sizing:border-box;position:relative;z-index:99;background:${colors.DARK_BLACK};
    & .inner-wrap{
        width:100%;max-width:${WIDTH};margin:auto;padding:25px 20px;box-sizing:border-box;display:flex;align-items:center;gap:10px;justify-content:space-between;
        & .logo-wrap{
            & .link{
                display:flex;align-items:center;gap:10px;font-size:24px;font-weight:500;color:${colors.WHITE};
                & .logo{display:flex;width:50px;}
                & span{font-size:24px;font-weight:500;color:${colors.WHITE};}
            }
        }
        & .navigation-wrap{
            display:flex;align-items:center;gap:20px;
            & .menu-link{
                display:flex;text-decoration:none;color:${colors.WHITE};font-size:16px;font-weight:500;line-height:1.2;cursor:pointer;column-gap:10px;
                &.active{color:${colors.GREEN};}
            }
        }
        & .btns{
            display:flex;align-items:center;gap:10px;
            & .btn{
                font-size:16px;height:40px;color:${colors.WHITE};background:${colors.GREEN};display:flex;align-items:center;padding:0 15px;border-radius:4px;cursor:pointer;
                &:hover{background:${colors.WHITE};color:${colors.BLACK};}
            }
        }
        & .user-details{
            display:flex;align-items:center;column-gap:15px;margin-left:auto;position:relative;
            & .img-wrap{
                width:40px;height:40px;border-radius:20px;position:relative;overflow:hidden;
                & img{width:100%;}
            }
            & .dropdown-content{
                display:none;background:${colors.SECONDARY};min-width:220px;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);z-index:1;font-size:14px;margin-top:40px;border-radius:10px;position:absolute;right:4px;top:0;overflow:hidden;border:1px solid ${colors.TERTIARY};
                & .name-img-wrap{
                    display:flex;flex-direction:column;padding:10px;align-items:center;border-bottom:1px solid ${colors.TERTIARY};
                    & .img-wrap{
                        width:80px;height:80px;border-radius:80px;position:relative;overflow:hidden;margin-bottom:10px;
                        & img{width:100%;}
                    }
                    & .name{color:${colors.WHITE};font-size:18px;line-height:22px;text-transform:capitalize;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;}
                    & .role{color:${colors.WHITE};font-size:14px;line-height:18px;text-transform:capitalize;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;}
                }
                & .menu-link{
                    color:${colors.WHITE};padding:12px 16px;cursor:pointer;text-decoration:none;display:flex;align-items:center;column-gap:6px;border-bottom:1px solid ${colors.TERTIARY};
                    &:last-child{border-bottom:none;}
                    &:hover{background-color:${colors.TERTIARY};}
                }
            }
            &:hover{
                & .dropdown-content{display:block;}
            }
        }
        & .menu-btn{display:none;width:35px;height:35px;background:${colors.GREEN};border:none;cursor:pointer;border-radius:3px;align-items:center;justify-content:center;}
    }
    @media(max-width:800px){
        & .inner-wrap{
            & .navigation-wrap{
                &.hide{display:none;}
                &.show{
                    z-index:1;
                    flex-direction:column;align-items:start;row-gap:15px;background:${colors.WHITE};box-shadow:0 0 5px 0px #776d6d;border-radius:5px;padding:20px;position:absolute;top:80px;right:20px;left:20px;
                    & .menu-link{
                        display:flex;text-decoration:none;color:${colors.BLACK};
                        &.active{color:${colors.GREEN};}    
                    }
                }
            }
            & .user-details{
                margin:0;
                & .dropdown-content{
                    left:0;top:0;
                    & .menu-link{color:${colors.WHITE};}
                }
            }
            & .menu-btn{z-index:1;display:flex;align-items:center;justify-content:center;}
        }
    }
`;
const Header = ({currentUser,page}) => {
    const [showNavigation,setShowNavigation] = useState(false);
    useEffect(() => {
        window.addEventListener("resize",resizeListener);
    },[]);
    const resizeListener = () => {
        const width = window.innerWidth;
        if(width < 801){
            setShowNavigation(false);
        }else if(width >= 801){
            setShowNavigation(true);
        }
    }
    const toggleMenu = (value) => {
        setShowNavigation(value);
    }
    const checkMultiRoleUrl = (userRoles,url) => {
        if(checkRolesCode(userRoles,ROLES.ADMIN.code)){
            url = `admin/${url}`;
        }else if(checkRolesCode(userRoles,ROLES.USER.code)){
            url = `user/${url}`;
        }
        return `${BASE_URL}/${url}`;
    }
    const logoutUser = () => {
        sweetAlertHelper({title: "<strong>Confirm</strong>",html: "Are you sure you want to logout?",showCancelButton: true}).then((result) => {
            if(result.isConfirmed){
                Cookies.remove(`${APP_SLUG}-user`);
                Cookies.remove(`${APP_SLUG}-token`);
                window.location = "/";
            }
        });
    }
    return (
        <Wrap>
            <div className="inner-wrap">
                <div className="logo-wrap">
                    <a className="link" href={BASE_URL}>
                        <img className="logo" src="/assets/images/logo.png" alt={APP_NAME}/>
                        <span>{APP_NAME}</span>
                    </a>
                </div>
                <div className={showNavigation ? "navigation-wrap show" : "navigation-wrap hide"}>
                    <a href={`${BASE_URL}/about-us`} className={`menu-link ${((page == "about-us") ? "active" : "")}`}>About Us</a>
                    <a href={`${BASE_URL}/how-it-work`} className={`menu-link ${((page == "how-it-work") ? "active" : "")}`}>How it Works</a>
                    <a href={`${BASE_URL}/faqs`} className={`menu-link ${((page == "faqs") ? "active" : "")}`}>FAQs</a>
                    <a href={`${BASE_URL}/pricing`} className={`menu-link ${((page == "pricing") ? "active" : "")}`}>Pricing</a>
                    <a href={`${BASE_URL}/contact-us`} className={`menu-link ${((page == "contact-us") ? "active" : "")}`}>Contact us</a>
                    {currentUser ? (
                        <div className="user-details dropdown">
                            <div className="img-wrap">
                                <img src={`${BASE_URL}/assets/images/user.png`}/>
                            </div>
                            <div className="dropdown-content">
                                <div className="name-img-wrap">
                                    <div className="img-wrap">
                                        <img src={`${BASE_URL}/assets/images/user.png`}/>
                                    </div>
                                    <span className="name">{currentUser.name}</span>
                                    <span className="role">{currentUser.roles ? currentUser.roles.join(" | ").replaceAll("-"," ") : ""}</span>
                                </div>
                                {(hasPermissions(currentUser.roles,"DASHBOARD","VIEW") && (checkRolesCode(currentUser.roles,ROLES.ADMIN.code) || (checkRolesCode(currentUser.roles,ROLES.USER.code) && currentUser.membership_id)))  ? (
                                    <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'dashboard')}>
                                        {dashboardIcon({width:16,height:16,fill:colors.WHITE})}
                                        <span>Dashboard</span>
                                    </a>
                                ) : null}
                                {(hasPermissions(currentUser.roles,"MY_ACCOUNT","VIEW") && (checkRolesCode(currentUser.roles,ROLES.USER.code) && currentUser.membership_id)) ? (
                                    <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'my-account')}>
                                        {dashboardIcon({width:16,height:16,fill:colors.WHITE})}
                                        <span>My Account</span>
                                    </a>
                                ) : null}
                                {(hasPermissions(currentUser.roles,"PROFILE","VIEW") && (checkRolesCode(currentUser.roles,ROLES.ADMIN.code) || (checkRolesCode(currentUser.roles,ROLES.USER.code) && currentUser.membership_id))) ? (
                                    <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'profile')}>
                                        {profileIcon({width:16,height:16,fill:colors.WHITE})}
                                        <span>My Profile</span>
                                    </a>
                                ) : null}
                                {(hasPermissions(currentUser.roles,"CHANGEPASSWORD","VIEW") && (checkRolesCode(currentUser.roles,ROLES.ADMIN.code) || (checkRolesCode(currentUser.roles,ROLES.USER.code) && currentUser.membership_id))) ? (
                                    <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'change-password')}>
                                        {changePasswordIcon({width:16,height:16,fill:colors.WHITE})}
                                        <span>Change Password</span>
                                    </a>
                                ) : null}
                                {(checkRolesCode(currentUser.roles,ROLES.USER.code) && !currentUser.membership_id) && (
                                    <a className="menu-link" href={`${BASE_URL}/payment`}>
                                        {changePasswordIcon({width:16,height:16,fill:colors.WHITE})}
                                        <span>Choose Plan</span>
                                    </a>
                                )}
                                <a className="menu-link" onClick={logoutUser}>
                                    {logoutIcon({width:16,height:16})}
                                    <span>Logout</span>
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="btns">
                            <a className="btn" href={`${BASE_URL}/login`}>Log In</a>
                            <a className="btn" href={`${BASE_URL}/register`}>Sign Up</a>
                        </div>
                    )}
                </div>
                <button className="menu-btn" onClick={() => toggleMenu(!showNavigation)}>
                    {!showNavigation ? (
                        menuIcon({width:22,height:22,fill:colors.WHITE})
                    ) : (
                        crossIcon({width:22,height:22,fill:colors.WHITE})
                    )}
                </button>
            </div>
        </Wrap>
    );
}
export default Header;