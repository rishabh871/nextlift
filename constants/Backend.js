const bconfig = require("../config/backend");
const fConfig = require("../config/frontend");

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
    APP_NAME: fConfig.APP_NAME,
    AWSSNS: {
        accessKeyId: bconfig.AWS.KEY,
        secretAccessKey: bconfig.AWS.SECRET,
        region: bconfig.AWS.REGION,
        bucketName: bconfig.AWS.BUCKET_NAME,
        bucketBaseUrl: bconfig.BUCKET_URL
    },
    BASE_URL: fConfig.BASE,
    CHATBOT: {
        FB_VERSION: bconfig.CHATBOT.FB_VERSION,
        FB_SENDER_ID: bconfig.CHATBOT.FB_SENDER_ID,
        FB_ACCESS_TOKEN: bconfig.CHATBOT.FB_ACCESS_TOKEN,
        FB_VERIFY_TOKEN: bconfig.CHATBOT.FB_VERIFY_TOKEN,
        NSW_API_KEY: bconfig.CHATBOT.NSW_API_KEY,
        TWILIO_ACCOUNT_SID: bconfig.CHATBOT.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: bconfig.CHATBOT.TWILIO_AUTH_TOKEN,
        TWILIO_FROM_NUMBER: bconfig.CHATBOT.TWILIO_FROM_NUMBER
    },
    CRON_EMAILS: {
        PER_SECONDS: bconfig.CRON_EMAILS.PER_SECONDS || 2,
        DURATION: bconfig.CRON_EMAILS.DURATION || 3
    },
    CRYPTO_SECRET_KEY: bconfig.CRYPTO_SECRET_KEY,
    DELETE_FLAG: {FALSE: 0,TRUE: 1},
    FORGOT_TOKEN_EXPIRE_TIME: 60,
    JWT_ACCESS_TOKEN: bconfig.JWT_ACCESS_TOKEN,
    LOGS_DAYS: 7,
    OPEN_API_KEY: bconfig.OPEN_API_KEY,
    RECAPTCHA: {
        SHOW: fConfig.RECAPTCHA.SHOW || false,
        SITE_KEY: fConfig.RECAPTCHA.SITE_KEY,
        SECRET_KEY: bconfig.RECAPTCHA.SECRET_KEY,
        SITE_VERIFY_URL: bconfig.RECAPTCHA.SITE_VERIFY_URL
    },
    ROLES: {
        ADMIN: {id: 1,name: "Admin",code: "admin"},
        USER: {id: 2,name: "User",code: "user"}
    },
    SALT_ROUNDS: 9,
    SERVER_IP: bconfig.SERVER_IP || "",
    SESSION_KEY: bconfig.SESSION_KEY,
    SMTP: {
        HOST: bconfig.SMTP.HOST,
        PORT: bconfig.SMTP.PORT,
        USER: bconfig.SMTP.USER,
        PASS: bconfig.SMTP.PASS,
        FROM: bconfig.SMTP.FROM
    },
    STATUS_FLAG: {ACTIVE: 1,INACTIVE: 0,DISABLED: 2},
    STRIPE: {
        PRIVATE_KEY: bconfig.STRIPE.PRIVATE_KEY
    },
    STRIPE_STATUS: {
        ACTIVE : "active",
        TRIALING : "trialing"
    }
}