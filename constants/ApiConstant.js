import {BASE_URL} from "./Common";
module.exports = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/v1/login`,
        FORGOT: `${BASE_URL}/auth/v1/forgot-password`,
        RESETTOKEN: `${BASE_URL}/auth/v1/reset-password-token`,
        RESETPASSWORD: `${BASE_URL}/auth/v1/reset-password`,
        REGISTER: `${BASE_URL}/auth/v1/register`,
        PLANS: `${BASE_URL}/auth/v1/plans`,
        MEMBERSHIPS: `${BASE_URL}/api/v1/memberships`,
        STATES: `${BASE_URL}/auth/v1/states`
    },
    FAQS: {
        LISTS: `${BASE_URL}/api/v1/faqs/lists`,
        ADDUPDATE: `${BASE_URL}/api/v1/faqs/add-or-update`,
        VIEW: `${BASE_URL}/api/v1/faqs/view`,
        STATUS: `${BASE_URL}/api/v1/faqs/status`,
        DELETE: `${BASE_URL}/api/v1/faqs/delete`
    },
    MEDIA: {
        UPLOAD: `${BASE_URL}/api/v1/media/upload`,
        DELETE: `${BASE_URL}/api/v1/media/delete`
    },
    MEMBERSHIPS: {
        LISTS: `${BASE_URL}/api/v1/memberships/lists`,
        ADDUPDATE: `${BASE_URL}/api/v1/memberships/add-or-update`,
        VIEW: `${BASE_URL}/api/v1/memberships/view`,
        STATUS: `${BASE_URL}/api/v1/memberships/status`,
        DELETE: `${BASE_URL}/api/v1/memberships/delete`
    },
    PAGES: {
        LISTS: `${BASE_URL}/api/v1/pages/lists`,
        ADDUPDATE: `${BASE_URL}/api/v1/pages/add-or-update`,
        STATUS: `${BASE_URL}/api/v1/pages/status`,
        VIEW: `${BASE_URL}/api/v1/pages/view`,
        DELETE: `${BASE_URL}/api/v1/pages/delete`,
        WEBPAGE: `${BASE_URL}/auth/v1/pages`,
    },
    PAYMENTS: {
        FREE: `${BASE_URL}/api/v1/user-free-plan`,
        PREMIUM: `${BASE_URL}/api/v1/user-premium-plan`
    },
    PROFILE: {
        CHANGEPASSWORD: `${BASE_URL}/api/v1/change-password`,
        VIEW: `${BASE_URL}/api/v1/profile`,
        CARDS: `${BASE_URL}/api/v1/user-cards`,
        CHANGE_BILLING_ADDRESS: `${BASE_URL}/api/v1/change-billing-address`,
        CHANGE_CARD: `${BASE_URL}/api/v1/change-card`
    },
    USERS: {
        LISTS: `${BASE_URL}/api/v1/users/lists`,
        ADDUPDATE: `${BASE_URL}/api/v1/users/add-or-update`,
        STATUS: `${BASE_URL}/api/v1/users/status`,
        DELETE: `${BASE_URL}/api/v1/users/delete`
    },
    STOP_WORDS: {
        LISTS: `${BASE_URL}/api/v1/stop-words/lists`,
        ADDUPDATE: `${BASE_URL}/api/v1/stop-words/add-or-update`,
        DELETE: `${BASE_URL}/api/v1/stop-words/delete`
    },
    SUBSCRIPTIONS: {
        CANCEL: `${BASE_URL}/api/v1/subscription/cancel`,
        REFUND: `${BASE_URL}/api/v1/subscription/refund`
    },
    TRANSACTIONS: {
        LISTS: `${BASE_URL}/api/v1/transactions/lists`,
        VIEW: `${BASE_URL}/api/v1/transactions/view`
    }
}