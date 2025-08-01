import {PERMISSION_STATUS} from "@constants/Common";
module.exports = {
    ROLES: [
        {
            id: 1,
            name: "Admin",
            code: "admin",
            modules: [
                {PROFILE: {VIEW: PERMISSION_STATUS.TRUE}},
                {CHANGEPASSWORD: {VIEW: PERMISSION_STATUS.TRUE}},
                {DASHBOARD: {VIEW: PERMISSION_STATUS.TRUE}},
                {USERS: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.TRUE}},
                {PAGES: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.FALSE,VIEW: PERMISSION_STATUS.TRUE}},
                {MEMBERSHIPS: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.TRUE}},
                {TRANSACTIONS: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.TRUE}},
                {FAQS: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.TRUE}},
                {STOP_WORDS: {LIST: PERMISSION_STATUS.TRUE,ADD: PERMISSION_STATUS.TRUE,EDIT: PERMISSION_STATUS.TRUE,DELETE: PERMISSION_STATUS.TRUE}}
            ]
        },
        {
            id: 2,
            name: "User",
            code: "user",
            modules: [
                {PROFILE: {VIEW: PERMISSION_STATUS.TRUE}},
                {CHANGEPASSWORD: {VIEW: PERMISSION_STATUS.TRUE}},
                {MY_ACCOUNT: {VIEW: PERMISSION_STATUS.TRUE}},
                {PAYMENT: {VIEW: PERMISSION_STATUS.TRUE}}
            ]
        }
    ]
};