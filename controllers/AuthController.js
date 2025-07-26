const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const db = require("../database/db");
const {API_STATUS,AWSSNS,DELETE_FLAG,FORGOT_TOKEN_EXPIRE_TIME,JWT_ACCESS_TOKEN,RECAPTCHA,ROLES,SALT_ROUNDS,STATUS_FLAG} = require("../constants/Backend");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const {forgotPasswordMail,registerMail} = require("../helpers/Emails");
const {generateCustomerID} = require("../helpers/Stripe");
const {getData,insertData,updateData,deleteData} = require("../helpers/QueryHelper");
const messages = require("../constants/Messages");
Promise.promisifyAll(jwt);

module.exports = {
    login: async function(req,res){
        let connection;
        let {email,password,recaptcha_token} = req.body;
        try{
            connection = await db.getConnectionAsync();
            if(RECAPTCHA.SHOW){
                $validateCaptcha = await helpers.validateCaptcha(recaptcha_token);
                if(!$validateCaptcha){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,messages: messages.reCaptcha});
                }
            }
            const [user] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`email="${email}"`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: " ",password: messages.invalidEmailPass}});
            }
            if(user.is_deleted){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: " ",password: messages.suspendedAccount}});
            }
            if(!user.status){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: " ",password: messages.inactiveAccount}});
            }
            const hash = user.password ? user.password : "";
            const match = await bcrypt.compare(password,hash);
            if(!match){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: " ",password: messages.invalidEmailPass}});
            }
            const {roleCodes,roleNames} = await helpers.getUserRoles(connection,user.id);
            user.roles = roleCodes;
            user.roleNames = roleNames;
            user.nextBillingDate = user.stripe_next_billing_date ? user.stripe_next_billing_date.toISOString() : null;
            user.subscriptionId = user.stripe_last_transaction_id;
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.USERS,{last_login:dateTime},`id=${user.id}`);
            delete user.password;
            delete user.stripe_next_billing_date;
            delete user.stripe_last_transaction_id;
            delete user.last_login;
            delete user.is_deleted;
            delete user.updated_at;
            delete user.deleted_at;
            const payload = {...user};
            let token = await jwt.signAsync(payload,JWT_ACCESS_TOKEN,{expiresIn: "24h"});
            token = await helpers.cryptoJSEncDec(token,"enc");
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,token,user: payload});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    forgotPassword: async function(req,res){
        let connection;
        let {email,recaptcha_token} = req.body;
        try{
            connection = await db.getConnectionAsync();
            if(RECAPTCHA.SHOW){
                $validateCaptcha = await helpers.validateCaptcha(recaptcha_token);
                if(!$validateCaptcha){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,messages: messages.reCaptcha});
                }
            }
            const [user] = await getData(connection,t.USERS,`*`,`email="${email}" AND is_deleted = 0`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email:  messages.emailNotExist}});
            }
            if(user.status == STATUS_FLAG.INACTIVE){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: messages.inactiveAccount}});
            }
            const token = uniqid();
            const tokenExpireTime = (await helpers.dateConvertToUTC("","","",0,FORGOT_TOKEN_EXPIRE_TIME)).totalDate;
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await deleteData(connection,t.PASSWORD_RESET,`email = "${email}"`);
            await insertData(connection,t.PASSWORD_RESET,{email,token,expired_at: tokenExpireTime,created_at: dateTime});
            await forgotPasswordMail(connection,user.name,user.email,token,dateTime);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.forgot});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    forgotPasswordToken: async function(req,res){
        let connection;
        let {token} = req.query;
        try{
            connection = await db.getConnectionAsync();
            const currentDateTime = (await helpers.dateConvertToUTC()).totalDate;
            const [resetUser] = await getData(connection,t.PASSWORD_RESET,`*`,`token="${token}"`);
            if(!resetUser){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,errors: {message: messages.tokenExpired}});
            }
            if(new Date(currentDateTime) > new Date(resetUser.expired_at)){
                await deleteData(connection,t.PASSWORD_RESET,`token = "${token}"`);
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,errors: {message: messages.tokenExpired}});
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.tokenFound,token: token});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    resetPassword: async function(req,res){
        let connection;
        try{
            let {token,password,recaptcha_token} = req.body;
            password = password.trim();
            connection = await db.getConnectionAsync();
            if(RECAPTCHA.SHOW){
                $validateCaptcha = await helpers.validateCaptcha(recaptcha_token);
                if(!$validateCaptcha){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,messages: messages.reCaptcha});
                }
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            const [resetUser] = await getData(connection,t.PASSWORD_RESET,`*`,`token="${token}"`);
            if(!resetUser){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,message: messages.tokenExpired});
            }
            if(new Date(dateTime) > new Date(resetUser.expired_at)){
                await deleteData(connection,t.PASSWORD_RESET,`token = "${token}"`);
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,message: messages.tokenExpired});
            }
            const [user] = await getData(connection,t.USERS,`*`,`email="${resetUser.email}" AND is_deleted = 0`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {password: messages.invalidAccount}});
            }
            if(user.status == STATUS_FLAG.INACTIVE || !user.password){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {password: messages.inactiveAccount}});
            }
            const match = await bcrypt.compare(password,user.password);
            if(match){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {password: messages.unMatchedPass}});
            }
            const hash = bcrypt.hashSync(password,SALT_ROUNDS);
            await updateData(connection,t.USERS,{password: hash,updated_at: dateTime},`id = ${user.id}`);
            await deleteData(connection,t.PASSWORD_RESET,`token = "${token}"`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.restSuccess});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    register: async function(req,res){
        let connection;
        let {first_name,last_name,email,password,recaptcha_token} = req.body;
        try{
            connection = await db.getConnectionAsync();
            if(RECAPTCHA.SHOW){
                $validateCaptcha = await helpers.validateCaptcha(recaptcha_token);
                if(!$validateCaptcha){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.COMMON_REQUEST,messages: messages.reCaptcha});
                }
            }
            first_name = await helpers.capitalizeName(first_name);
            last_name = await helpers.capitalizeName(last_name);
            const [checkUserEmail] = await getData(connection,t.USERS,`id`,`email="${email}"`);
            if(checkUserEmail){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: messages.emailExists}});
            }
            let name = `${first_name} ${last_name}`;
            const hash = bcrypt.hashSync(password,SALT_ROUNDS);
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            let slug = await helpers.createSlug(connection,"U",t.USERS,"slug");
            let userObj = {slug,first_name,last_name,name,email,password: hash,created_at: dateTime,updated_at: dateTime};
            const userId = (await insertData(connection,t.USERS,userObj)).insertId;
            await generateCustomerID({id: userId,name,email},connection);
            await insertData(connection,t.USER_HAS_ROLES,{user_id: userId,role_id: ROLES.USER.id});
            const [user] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`id = ${userId}`);
            user.roles = [ROLES.USER.code];
            user.roleNames = [ROLES.USER.name];
            user.nextBillingDate = user.stripe_next_billing_date ? user.stripe_next_billing_date.toISOString() : null;
            user.subscriptionId = user.stripe_last_transaction_id;
            delete user.password;
            delete user.stripe_next_billing_date;
            delete user.stripe_last_transaction_id;
            delete user.is_deleted;
            delete user.deleted_by;
            delete user.deleted_at;
            const payload = {...user};
            let token = await jwt.signAsync(payload,JWT_ACCESS_TOKEN,{expiresIn: "24h"});
            token = await helpers.cryptoJSEncDec(token,"enc");
            await updateData(connection,t.USERS,{last_login: dateTime},`id = ${userId}`);
            await registerMail(connection,name,email,password,dateTime);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.registered,token,user: payload});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    states: async function(req,res){
        let connection;
        try{
            connection = await db.getConnectionAsync();
            const states = await getData(connection,t.STATES,`id,name`,`is_deleted = ${DELETE_FLAG.FALSE}`);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,states});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    faqs: async function(req,res){
        let connection;
        try{
            connection = await db.getConnectionAsync();
            const faqs = await getData(connection,t.FAQS,`id,question,answer`,`is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE} ORDER BY display_position ASC LIMIT 0,8`);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,faqs});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}