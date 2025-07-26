const jwt = require("jsonwebtoken");
const {API_STATUS,JWT_ACCESS_TOKEN,SERVER_IP,SESSION_KEY} = require("../constants/Backend");
const db = require("../database/db");
const t = require("../constants/Tables");
const messages = require("../constants/Messages");
const helpers = require("../helpers/Common");
const {getData} = require("../helpers/QueryHelper");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MobileDetect = require("mobile-detect");
const cors = require("cors");
const Promise = require("bluebird");
Promise.promisifyAll(jwt);

module.exports = function({server,app,dev}){
    const requestCount = {};
    server.use(morgan("dev"));
    server.use(cookieParser(SESSION_KEY));
    server.use(cors({"allowedHeaders": "*","origin": "*","methods": "*","preflightContinue": false}));
    server.use(bodyParser.json({limit: "50mb"}));
    server.use(bodyParser.urlencoded({extended: true}));
    server.use(session({secret: SESSION_KEY,saveUninitialized: true,resave: false}));
    server.use((req,res,next) => {
        if(req.path.substr(-1) == "/" && req.path.length > 1){
            let query = req.url.slice(req.path.length);
            res.redirect(API_STATUS.MOVED_PERMANENTLY,req.path.slice(0,-1) + query);
        }else{
            next();
        }
    });
    server.use((req,res,next) => {
        if(/\/{2,}/g.test(req.path)){
            let query = req.url.slice(req.path.length);
            let path = req.path.replace(/\/{2,}/g,"/");
            res.redirect(API_STATUS.MOVED_PERMANENTLY,path + query);
        }else{
            next();
        }
    });
    // Custom middleware for request throttling
    // Apply the throttle middleware to all routes or specific routes
    server.use((req, res, next) => {
        const MAX_REQUESTS_PER_MINUTE = 100; // Maximum requests allowed per minute
        const windowMs = 30 * 1000; // 30 seconds
        let shouldApplyThrottle = false;
        // Check if the route contains "api" or "web"
        if(req.url.includes("api") || req.url.includes("auth")){
            shouldApplyThrottle = true;
        }
        // Check if the request count exceeds the limit only for routes containing "api" or "web"
        if(shouldApplyThrottle){
            // Implement a storage mechanism to track request counts per IP address
            // For simplicity, we'll use an in-memory object to store the request counts
            let ipAddress = req.ip;
            // If behind a proxy, use 'X-Forwarded-For' header for more accurate client IP
            const forwardedIps = req.headers['x-forwarded-for'];
            if(forwardedIps){
                const ipArray = forwardedIps.split(',');
                ipAddress = ipArray[0];
            }
            if(SERVER_IP != ipAddress){
                if(requestCount[ipAddress] && requestCount[ipAddress] >= MAX_REQUESTS_PER_MINUTE){
                    return res.status(API_STATUS.TOO_MANY_REQUESTS).json({status: API_STATUS.TOO_MANY_REQUESTS,message: messages.manyRequest});
                }
            }
            requestCount[ipAddress] = (requestCount[ipAddress] || 0) + 1;
            setTimeout(() => {
                requestCount[ipAddress] = (requestCount[ipAddress] || 0) - 1;
            },windowMs);
        }
        // Proceed to the next middleware or route handler
        next();
    });
    server.use((req,res,next) => {
        md = new MobileDetect(req.headers["user-agent"]);
        req.mobile = md.mobile();
        req.tz = req.headers["tz"] ? req.headers["tz"] : "America/chicago";
        next();
    });
    server.use("/api",async(req,res,next) => {
        let connection;
        try{
            let accessToken = req.headers["authorization"];
            if(!accessToken){
                return res.status(API_STATUS.UNAUTHORIZED).json({status: API_STATUS.UNAUTHORIZED,message: messages.unAuthorizeLogin});
            }
            accessToken = await helpers.cryptoJSEncDec(accessToken);
            const user = await jwt.verifyAsync(accessToken,JWT_ACCESS_TOKEN);
            connection = await db.getConnectionAsync();
            const [users] = await getData(connection,t.USERS,`*`,`id = ${user.id} AND is_deleted = 0`);
            if(!users){
                return res.status(API_STATUS.UNAUTHORIZED).json({status: API_STATUS.UNAUTHORIZED,message: messages.unAuthorizeLogin});
            }
            if(!users.status){
                return res.status(API_STATUS.UNAUTHORIZED).send({status: API_STATUS.UNAUTHORIZED,message: messages.blocked});
            }
            const {roleIds,roleCodes} = await helpers.getUserRoles(connection,users.id);
            users.roleIds = roleIds;
            users.roleCodes = roleCodes;
            req.user = users;
        }catch(e){
            return res.status(API_STATUS.UNAUTHORIZED).json({status: API_STATUS.UNAUTHORIZED,message: messages.unAuthorizeLogin});
        }finally{
            if(connection){
                connection.release();
            }
        }
        next();
    });
}