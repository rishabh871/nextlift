import React from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import sweetAlertHelper from "@helpers/SweetAlert";
import Image from "@helpers/FrontImage";
import {checkRolesCode} from "@helpers/Frontend";
import {APP_SLUG,BASE_URL,ROLES} from "@constants/Common";
import colors from "@constants/Colors";
import hasPermissions from "@helpers/UserRoles";
import {profileIcon,changePasswordIcon,logoutIcon,menuIcon} from "@helpers/Icons";
const Wrapper = styled.div`
    padding:15px 25px;background:${colors.SECONDARY};box-sizing:border-box;width:100%;display:flex;position:relative;box-shadow:0px 3px 6px #0000000f;
    & .menu-btn{display:flex;align-items:center;justify-content:center;border:none;background:none;cursor:pointer;padding:4px;}
    & .user-details{
        display:flex;align-items:center;margin-left:auto;position:relative;
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
`;
const Navbar = ({currentUser,toggleSidebar}) => {
    const logoutUser = () => {
        sweetAlertHelper({title: "<strong>Confirm</strong>",html: "Are you sure you want to logout?",showCancelButton: true}).then((result) => {
            if(result.isConfirmed){
                Cookies.remove(`${APP_SLUG}-user`);
                Cookies.remove(`${APP_SLUG}-token`);
                window.location = "/";
            }
        });
    }
    const checkMultiRoleUrl = (roles,url) => {
        if(checkRolesCode(roles,ROLES.ADMIN.code)){
            url = `/admin/${url}`;
        }else if(checkRolesCode(roles,ROLES.USER.code)){
            url = `/user/${url}`;
        }
        return `${BASE_URL}${url}`;
    }
    return (
        <Wrapper>
            <button onClick={toggleSidebar} className="menu-btn">{menuIcon({width:28,height:28,fill:colors.WHITE})}</button>
            <div className="user-details dropdown">
                <div className='img-wrap'>
                    <Image src={currentUser.picture ? currentUser.picture : `${BASE_URL}/assets/images/user.png`} alt={currentUser.name} layout="fill" objectFit="cover" fill/>
                </div>
                <div className="dropdown-content">
                    <div className="name-img-wrap">
                        <div className="img-wrap">
                            <img src={`${BASE_URL}/assets/images/user.png`}/>
                        </div>
                        <span className="name">{currentUser.name}</span>
                        <span className="role">{currentUser.roles ? currentUser.roles.join(" | ").replaceAll("-"," ") : ""}</span>
                    </div>
                    {hasPermissions(currentUser.roles,"PROFILE","VIEW") ? (
                        <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'profile')}>
                            {profileIcon({width:16,height:16,fill:colors.WHITE})}
                            <span>My Profile</span>
                        </a>
                    ) : null}
                    {hasPermissions(currentUser.roles,"CHANGEPASSWORD","VIEW") ? (
                        <a className="menu-link" href={checkMultiRoleUrl(currentUser.roles,'change-password')}>
                            {changePasswordIcon({width:16,height:16,fill:colors.WHITE})}
                            <span>Change Password</span>
                        </a>
                    ) : null}
                    <a className="menu-link" onClick={logoutUser}>
                        {logoutIcon({width:16,height:16})}
                        <span>Logout</span>
                    </a>
                </div>
            </div>
        </Wrapper>
    );
}
export default Navbar;