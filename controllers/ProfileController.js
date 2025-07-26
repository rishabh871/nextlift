const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const stripe = require("../helpers/Stripe");
const messages = require("../constants/Messages");
const {API_STATUS,AWSSNS,DELETE_FLAG,JWT_ACCESS_TOKEN,SALT_ROUNDS,STATUS_FLAG} = require("../constants/Backend");
const {getData,insertData,updateData} = require("../helpers/QueryHelper");
const {uploadFileToBucket,deleteFileFromBucket} = require("../helpers/Buckets");
Promise.promisifyAll(jwt);

module.exports = {
    view: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`is_deleted = ${DELETE_FLAG.FALSE} AND id = ${userId}`);
            if(!user){
                return res.status(API_STATUS.PRECONDITION_FAILED).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.profile.notFound});
            }
            const {roleCodes,roleNames} = await helpers.getUserRoles(connection,user.id);
            user.roles = roleCodes;
            user.roleNames = roleNames;
            user.nextBillingDate = user.stripe_next_billing_date ? user.stripe_next_billing_date.toISOString() : null;
            user.subscriptionId = user.stripe_last_transaction_id;
            delete user.password;
            delete user.stripe_next_billing_date;
            delete user.stripe_last_transaction_id;
            delete user.last_login;
            delete user.is_deleted;
            delete user.updated_at;
            delete user.deleted_at;
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,user});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    update: async function(req,res){
        let connection;
        let {first_name,last_name,phone,slogan,address,bio,facebook,twitter,linkedin,instagram,deletePhoto} = req.body;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            first_name = await helpers.capitalizeName(first_name);
            last_name = await helpers.capitalizeName(last_name);
            const [checkUserPhone] = await getData(connection,t.USERS,`id`,`phone = "${phone}" AND id != ${userId}`);
            if(checkUserPhone && checkUserPhone.length){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {phone: messages.phoneExists}});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            let name = `${first_name} ${last_name}`;
            slogan = slogan ? slogan : null;
            address = address ? address : null;
            bio = bio ? bio : null;
            facebook = facebook ? facebook : null;
            twitter = twitter ? twitter : null;
            linkedin = linkedin ? linkedin : null;
            instagram = instagram ? instagram : null;
            deletePhoto = ((deletePhoto && deletePhoto == "1") ? true : false);
            await updateData(connection,t.USERS,{first_name,last_name,name,phone,slogan,address,bio,facebook,twitter,linkedin,instagram,updated_at: dateTime},`id = ${userId}`);
            if(deletePhoto || (req.files && req.files.picture)){
                const [deletePicture] = await getData(connection,t.USERS,`picture`,`id = ${userId}`);
                if(deletePicture && deletePicture.picture){
                    await deleteFileFromBucket(deletePicture.picture);
                    await updateData(connection,t.USERS,{picture: null},`id = ${userId}`);
                }
            }
            if(req.files && req.files.picture){
                let {picture} = req.files;
                let uploadFile = await uploadFileToBucket(picture,"profile/");
                await updateData(connection,t.USERS,{picture: uploadFile.fileUrl},`id = ${userId}`);
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.profile.update});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    changePassword: async function(req,res){
        let connection;
        let {old_password,password} = req.body;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            const [user] = await getData(connection,t.USERS,`*`,`is_deleted = ${DELETE_FLAG.FALSE} AND id = ${userId}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {old_password: messages.invalidPass}});
            }
            const match = await bcrypt.compare(old_password,user.password);
            if(!match){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {old_password: messages.invalidPass}});
            }
            const hash = bcrypt.hashSync(password,SALT_ROUNDS);
            await updateData(connection,t.USERS,{password: hash,updated_at: dateTime},`id = ${userId}`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.profile.password});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    memberships: async function(req,res){
        let connection;
        try{
            const userId = req.user.id;
            let userSession = {id: userId,current_subscription_status: "",last_subscription_status: ""};
            connection = await db.getConnectionAsync();
            const memberships = await getData(connection,t.MEMBERSHIPS,`id,name,price,type,IF(banner IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",banner)) as banner,description,is_free`,`is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE} ORDER BY position ASC`);
            if(!memberships && !memberships.length){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.error});
            }
            const transactions = await getData(connection,t.TRANSACTIONS,`id,membership_id,status`,`user_id = ${userId} AND status IN ('active','upcoming','update','trialing') ORDER BY id DESC`);
            const [secondlastTransaction] = await getData(connection,t.TRANSACTIONS,`id,status AS subscription_status`,`user_id = ${userId} ORDER BY id DESC LIMIT 1 OFFSET 1`);
            const [currentTransaction] = await getData(connection,t.TRANSACTIONS,`id,status AS subscription_status`,`user_id = ${userId} ORDER BY id DESC`);
            if(secondlastTransaction){
                userSession.last_subscription_status = secondlastTransaction.subscription_status;
            }else{
                userSession.last_subscription_status = ""
            }
            if(currentTransaction){
                userSession.current_subscription_status = currentTransaction.subscription_status;
            }else{
                userSession.current_subscription_status = ""
            }
            let completeMembership = []
            let isPlanDown = true;
            for(let index = 0;index < memberships.length;index++){
                const element = memberships[index];
                const transActive = transactions.findIndex((x) => x.membership_id == element.id);
                if(transActive != -1){
                    element.is_subscribed = (transactions[transActive].status == "active" || transactions[transActive].status == "trialing") ? true : false
                    element.is_upcoming = (transactions[transActive].status == "upcoming") ? true : false
                    element.is_update = (transactions[transActive].status == "update") ? true : false
                    element.user_plan_status = transactions[transActive].status
                    if(transactions[transActive].status == "upcoming" || transactions[transActive].status == "update"){
                        isPlanDown = false
                    }
                }else{
                    element.is_subscribed = false
                    element.is_upcoming = false
                    element.is_update = false
                    element.user_plan_status = ""
                }
                const [user] = await getData(connection,t.USERS,`*`,`id = ${userId}`);
                if(element.id == 1 && user.stripe_subscription_end_date){
                    element.is_upcoming = true;
                }
                completeMembership.push(element)
            }
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,memberships: completeMembership,isPlanDown});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    freePlan: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            let {membership_id} = req.body;
            connection = await db.getConnectionAsync();
            const [membership] = await getData(connection,t.MEMBERSHIPS,'*',`id = ${membership_id} AND is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE}`);
            if(!membership){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.planNotExist});
            }
            if(!membership.is_free){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.planNotFree});
            }
            const [user] = await getData(connection,t.USERS,'*',`id = ${userId} AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(user.membership_id){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.alreadySubscribed});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.USERS,{membership_id,updated_at: dateTime},`id = ${userId}`);
            const [userObj] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`id = ${userId}`);
            const {roleCodes,roleNames} = await helpers.getUserRoles(connection,userId);
            userObj.roles = roleCodes;
            userObj.roleNames = roleNames;
            userObj.nextBillingDate = userObj.stripe_next_billing_date ? userObj.stripe_next_billing_date.toISOString() : null;
            userObj.subscriptionId = userObj.stripe_last_transaction_id;
            delete userObj.password;
            delete userObj.stripe_next_billing_date;
            delete userObj.stripe_last_transaction_id;
            delete userObj.last_login;
            delete userObj.is_deleted;
            delete userObj.updated_at;
            delete userObj.deleted_at;
            const payload = {...userObj};
            let token = await jwt.signAsync(payload,JWT_ACCESS_TOKEN,{expiresIn: "24h"});
            token = await helpers.cryptoJSEncDec(token,"enc");
            await insertData(connection,t.TRANSACTIONS,{membership_id,user_id: userId,first_name: userObj.first_name,last_name: userObj.last_name,phone: userObj.phone,email: userObj.email,status: 'active'});
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,token,user: payload});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    premiumPlan: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            let {membership_id} = req.body;
            connection = await db.getConnectionAsync();
            const [membership] = await getData(connection,t.MEMBERSHIPS,'*',`id = ${membership_id} AND is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE}`);
            if(!membership){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.planNotExist});
            }
            const [user] = await getData(connection,t.USERS,'*',`id = ${userId} AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(user.membership_id && membership_id == 1){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.alreadySubscribed});
            }
            const subscription = await stripe.createSubscription(connection,req.body,user,membership);
            if(!subscription.success){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: subscription.message ? subscription.message : messages.error});
            }
            let token = await jwt.signAsync(subscription.user,JWT_ACCESS_TOKEN,{expiresIn: "24h"});
            token = await helpers.cryptoJSEncDec(token,"enc");
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: subscription.message,token,user: subscription.user});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    userCards: async function(req,res){
        let connection;
        try{
            const userId = req.user.id;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`id = ${userId} AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            const [secondlastTransaction] = await getData(connection,t.TRANSACTIONS,`id,status AS subscription_status`,`user_id = ${user.id} ORDER BY id DESC LIMIT 1 OFFSET 1`);
            const [currentTransaction] = await getData(connection,t.TRANSACTIONS,`id,status AS subscription_status`,`user_id = ${user.id} ORDER BY id DESC`);
            let tableWithJoin = `${t.TRANSACTIONS} AS t LEFT JOIN ${t.MEMBERSHIPS} AS m ON t.membership_id = m.id`;
            const [transaction] = await getData(connection,tableWithJoin,`t.*,m.name AS membership`,`t.user_id = ${user.id} AND t.status = "upcoming" ORDER BY t.id DESC`);
            if(currentTransaction && currentTransaction.status == "incomplete"){
                currentTransaction.message = "Please update your payment information. If you haven't updated the payment information, your subscription will automatically convert to the Free Package.";
            }
            if(transaction){
                user.upcoming = true;
                user.upcomingPlanName = transaction.membership;
            }else{
                user.upcoming = false;
                user.upcomingPlanName = "";
            }
            if(secondlastTransaction){
                user.last_subscription_status = secondlastTransaction.subscription_status;
            }else{
                user.last_subscription_status = ""
            }
            if(currentTransaction){
                user.current_subscription_status = currentTransaction.subscription_status;
            }else{
                user.current_subscription_status = ""
            }
            const {paymentMethods,card,customerAddress} = await stripe.getUserCards(user.stripe_customer_id);
            const [plan] = await getData(connection,t.MEMBERSHIPS,`id,name,price,type,position,IF(banner IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",banner)) as banner,description,is_free`,`id = ${user.membership_id}`);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,user,card,paymentMethods,plan,customerAddress});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    changeCard: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,'*',`id = ${userId}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            const cardResponse = await stripe.changeCard(user,req.body);
            if(!cardResponse.success){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: cardResponse.message});
            }
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.stripe.cardChanged,customerCard: cardResponse.customerCard,customerAddress: cardResponse.customerAddress});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    changeBillingAddress: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,'*',`id = ${userId}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            const {customerAddress} = await stripe.updateAddress(user.stripe_customer_id,req.body);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.stripe.addressChanged,customerAddress});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    cancelSubscription: async function(req,res){
        let connection;
        try{
            const {id: userId} = req.user;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,'*',`id = ${userId}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            if(user.stripe_subscription_end_date){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: `This subscription is already canceled. and will be expired on ${moment(user.stripe_subscription_end_date).format('MMM DD, YYYY')}.`});
            }
            if(!user.is_subscribed){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.noActiveSubscription});
            }
            if(!user.stripe_last_transaction_id){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.error});
            }
            const subscription = await stripe.cancelSubscription(user,connection);
            if(!subscription.success){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: subscription.message});
            }
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: subscription.message});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}