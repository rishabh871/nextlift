import {handleForbidden,handleUnauthorized,checkRolesCode} from "@helpers/Frontend";
import hasPermissions from "@helpers/UserRoles";
import {APP_SLUG,ROLES} from "@constants/Common";
export async function getServerProps(context,otherProps,tag="",metaInfo=""){
    const currentUser = context.req.cookies[`${APP_SLUG}-user`] ? JSON.parse(context.req.cookies[`${APP_SLUG}-user`]) : null;
    if(tag){
        handleRoleCheck(context,tag,currentUser,metaInfo);
    }
    return {props: {currentUser,...otherProps}};
}
function handleRoleCheck(context,tag,currentUser,metaInfo){
    const [first,last] = tag.split(":");
    if(!currentUser){
        if(!context.res.enc_id){
            return handleUnauthorized(null,context.res);
        }
    }else{
        if(metaInfo && metaInfo.isNotMember && currentUser && checkRolesCode(currentUser.roles,ROLES.USER.code) && currentUser.membership_id){
            return handleUnauthorized(null,context.res);
        }
        if(metaInfo && metaInfo.isMembership && currentUser && checkRolesCode(currentUser.roles,ROLES.USER.code) && !currentUser.membership_id){
            return handleForbidden(context.res);
        }
        if(currentUser && currentUser.roles && !hasPermissions(currentUser.roles,first,last)){
            return handleForbidden(context.res);
        }
    }
}