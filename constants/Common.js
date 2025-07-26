const config = require("../config/frontend");
module.exports = {
    API_STATUS: {
        SUCCESS: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        CONFLICT: 409,
        PRECONDITION_FAILED: 412,
        DELETED_USER: 418,
        COMMON_REQUEST: 419,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },
    APP_NAME: config.APP_NAME,
    APP_SLUG: "nextlift",
    BASE_URL: config.BASE,
    COUNTRY_CODES: {
        AU: "AU"
    },
    DEFAULT_IMAGE_URL: `${config.BASE}/assets/images/default.png`,
    FILE_ACCEPTS: {
        DOCUMENTS: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
        IMAGES: "image/png,image/jpg,image/jpeg",
        PDF: "application/pdf",
        PPT: "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
        VIDEOS: "video/3gpp,video/mp4,video/mov,video/m4v,video/quicktime",
        IMAGE_VIDEO: "image/png,image/jpg,image/jpeg,video/3gpp,video/mp4,video/mov,video/m4v,video/quicktime"
    },
    FILE_TYPES: {
        DOCUMENTS: ["xls","xlsx","doc","docx","pdf","ppt","pptx"],
        IMAGES: ["png","jpg","jpeg"],
        PDF: ["pdf"],
        PPT: ["ppt","pptx"],
        VIDEOS: ["mp4","mov","m4v","3gpp"]
    },
    PAGE_TEMPLATES: [
        {id: "default",name: "Default"},
        {id: "contacts",name: "Contact Us"},
        {id: "faqs",name: "FAQs"},
        {id: "pricing",name: "Pricing"}
    ],
    PER_PAGE: [10,25,50,75,100,200,500],
    PERMISSION_STATUS: {TRUE: true,FALSE: false},
    RECAPTCHA: {
        SHOW: config.RECAPTCHA.SHOW || false,
        SITE_KEY: config.RECAPTCHA.SITE_KEY
    },
    ROLES: {
        ADMIN: {id: 1,name: "Admin",code: "admin"},
        USER: {id: 2,name: "User",code: "user"}
    },
    SLIDER_OPTIONS: {type: "loop",autoplay: true,interval: 3000,pauseOnHover: true,arrows: true,pagination: false,perPage: 1,gap:0},
    STRIPE: {
        PUBLIC_KEY: config.STRIPE.PUBLIC_KEY
    },
    TOAST_OPTIONS: {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: 0,
        theme: "colored"
    },
    WIDTH: "1440px"
}