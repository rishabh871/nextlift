import styled from "styled-components";
import {APP_NAME,BASE_URL,ROLES} from "@constants/Common";
import {checkRolesCode} from "@helpers/Frontend";
import colors from "@constants/Colors";
import hasPermissions from "@helpers/UserRoles";
import {dashboardIcon,usersIcon,pageIcon,faqsIcon,stopWordIcon} from "@helpers/Icons";
const Wrapper = styled.div`
    background:${colors.SECONDARY};box-sizing:border-box;width:70px;display:flex;flex-direction:column;padding:90px 0 10px;position:relative;transition:.1s;z-index:1;border-right:1px solid ${colors.BLACK};
    & .logo-wrap{
        display:flex;column-gap:10px;align-items:center;position:absolute;top:16px;left:12px;transition:.0s;font-size:24px;font-weight:500;color:${colors.WHITE};
        & img{width:46px;height:46px;display:flex;}
        & span{font-size:24px;font-weight:500;color:${colors.WHITE};}
        &.half{
            & span{display:none;}
        }
    }
    & .menu-wrap{
        list-style:none;margin:0;padding:0;display:flex;flex-direction:column;row-gap:6px;overflow-y:auto;
        & .menu-item{
            position:relative;padding:0 15px;margin:0 10px;border-radius:6px;transition:.3s;
            &.active,
            &:hover{background:${colors.RED};}
            & .menu-link{
                display:flex;align-items:center;justify-content:center;column-gap:10px;transition:.1s;text-decoration:none;cursor:pointer;font-size:16px;line-height:23px;font-weight:600;height:45px;color:${colors.WHITE};
                & svg{flex-shrink:0;}
                & span{display:none;}
            }
            & .dropdown{
                position:absolute;background:none;border:none;width:45px;height:45px;border-radius:6px;top:0;right:0;cursor:pointer;transition:.3s;display:none;
                &.rotate{rotate:90deg;}
            }
        }
        &.show{display:flex;row-gap:6px;}
    }
    &.overlay-menu{
        min-width:240px;height:100%;z-index:100;
        & .menu-wrap{
            & .menu-item{
                & .menu-link{
                    justify-content:flex-start;
                    & span{display:block;transition:.1s;}
                }
                & .dropdown{display:block;}
            }
        }
    }
`;
const Sidebar = ({page,currentUser,isShowSidebar}) => {
    const checkMultiRoleUrl = (roles,url) => {
        if(checkRolesCode(roles,ROLES.ADMIN.code)){
            url = `/admin/${url}`;
        }else if(checkRolesCode(roles,ROLES.USER.code)){
            if(url == "dashboard"){
                url = "my-account";
            }
            url = `/user/${url}`;
        }
        return `${BASE_URL}${url}`;
    }
    return (
        <Wrapper className={`${isShowSidebar ? "overlay-menu" : ""}`}>
            <a className={`${isShowSidebar ? `logo-wrap` : `logo-wrap half`}`} href={checkMultiRoleUrl(currentUser.roles,'dashboard')}>
                <img src={`${BASE_URL}/assets/images/${isShowSidebar ? `logo` : `favicon`}.png`} alt={APP_NAME}/>
                <span>{APP_NAME}</span>
            </a>
            <ul className="menu-wrap">
                {(currentUser && hasPermissions(currentUser.roles,"DASHBOARD","VIEW")) ? (
                    <li className={`menu-item ${((page == "dashboard") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/dashboard`} className="menu-link">
                            {dashboardIcon({width:22,height:22,fill:colors.WHITE})}
                            <span>Dashboard</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"MY_ACCOUNT","VIEW")) ? (
                    <li className={`menu-item ${((page == "my-account") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/user/my-account`} className="menu-link">
                            {dashboardIcon({width:22,height:22,fill:colors.WHITE})}
                            <span>My Account</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"USERS","LIST")) ? (
                    <li className={`menu-item ${((page == "users") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/users`} className="menu-link">
                            {usersIcon({width:21,height:21,fill:colors.WHITE})}
                            <span>Users</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"PAGES","LIST")) ? (
                    <li className={`menu-item ${((page == "pages") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/pages`} className="menu-link">
                            {pageIcon({width:21,height:21,fill:colors.WHITE})}
                            <span>CMS Pages</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"MEMBERSHIPS","LIST")) ? (
                    <li className={`menu-item ${((page == "memberships") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/memberships`} className="menu-link">
                            {pageIcon({width:21,height:21,fill:colors.WHITE})}
                            <span>Memberships</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"TRANSACTIONS","LIST")) ? (
                    <li className={`menu-item ${((page == "transactions") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/transactions`} className="menu-link">
                            {pageIcon({width:21,height:21,fill:colors.WHITE})}
                            <span>Transactions</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"FAQS","LIST")) ? (
                    <li className={`menu-item ${((page == "faqs") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/faqs`} className="menu-link">
                            {faqsIcon({width:26,height:26,fill:colors.WHITE})}
                            <span>FAQs</span>
                        </a>
                    </li>
                ) : null}
                {(currentUser && hasPermissions(currentUser.roles,"STOP_WORDS","LIST")) ? (
                    <li className={`menu-item ${((page == "stop-words") ? "active" : "")}`}>
                        <a href={`${BASE_URL}/admin/stop-words`} className="menu-link">
                            {stopWordIcon({width:26,height:26,fill:colors.WHITE})}
                            <span>Stop Words</span>
                        </a>
                    </li>
                ) : null}
            </ul>
        </Wrapper>
    );
}
export default Sidebar;