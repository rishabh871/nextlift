const {ROLES} = require("@constants/Roles");
const hasPermissions = (userRoles,module,action) => {
    if(userRoles.length){
        return userRoles.find((userRole) => {
            const role = ROLES.find((role) => role.code === userRole);
            if(role && role.modules){
                const modulePermissions = role.modules.find((moduleObj) => moduleObj[module] !== undefined);
                if(modulePermissions){
                    return modulePermissions[module][action] === true;
                }
            }
        });
    }
    return false;
};
export default hasPermissions;