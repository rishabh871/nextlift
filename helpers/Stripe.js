const moment = require("moment");
const t = require("../constants/Tables");
const helpers = require("./Common");
const messages = require("../constants/Messages");
const {API_STATUS,AWSSNS,STRIPE,STRIPE_STATUS} = require("../constants/Backend");
const {getData,updateData,insertData} = require("./QueryHelper");
const stripe = require('stripe')(STRIPE.PRIVATE_KEY);
const {sendChangePlanEmail,sendChangeCardEmail,cancelSubscriptionEmail} = require("./Emails");

const generateCustomerID = async (userObj,connection) => {
    try{
        if(userObj.stripe_customer_id){
            return {success: true,message: messages.stripe.customer.success,customer: {id: userObj.stripe_customer_id}};
        }else{
            const customer = await stripe.customers.create({name: userObj.name,email: userObj.email});
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.USERS,{stripe_customer_id: customer.id,updated_at: dateTime},`id = ${userObj.id}`);
            return {status: API_STATUS.SUCCESS,success: true,message: messages.stripe.customer.success,customer}
        }
    }catch(err){
        return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: (err && err.message) ? err.message : messages.stripe.customer.failure,customer: null};
    }
}
const changeCard = async(user,payload) => {
    let {street,city,state,zipcode,paymentId} = payload;
    try{
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);
        const allPaymentMethods = await stripe.paymentMethods.list({customer: user.stripe_customer_id,type: 'card'});
        let paymentMetholdId = null;
        if(allPaymentMethods.data){
            const data = allPaymentMethods.data;
            for(let i = 0;i < data.length;i++) {
                if(paymentMethod.card.fingerprint == data[i].card.fingerprint){
                    paymentMetholdId = data[i].id;
                }else{
                    await stripe.paymentMethods.detach(data[i].id);
                }
            }
        }
        if(!paymentMetholdId){
            const attachedPaymentMethodwithCustomer = await stripe.paymentMethods.attach(paymentId,{customer: user.stripe_customer_id});
            await stripe.customers.update(user.stripe_customer_id,{invoice_settings: {default_payment_method: attachedPaymentMethodwithCustomer.id}});
        }else{
            await stripe.customers.update(user.stripe_customer_id,{invoice_settings: {default_payment_method: paymentMetholdId}});
        }
        await stripe.customers.update(user.stripe_customer_id,{address: {line1: street,city,state,postal_code: zipcode,country: "AU"}});
        const stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id);
        const paymentMethods = await stripe.paymentMethods.list({customer: user.stripe_customer_id,type: 'card'});
        let defaultCard = paymentMethods.data[0];
        let customerCard = {}
        if(defaultCard){
            customerCard = {
                id: defaultCard.id,
                brand: defaultCard.card.brand,
                exp_month: defaultCard.card.exp_month,
                exp_year: defaultCard.card.exp_year,
                fingerprint: defaultCard.card.fingerprint,
                funding: defaultCard.card.funding,
                last4: defaultCard.card.last4
            }
        }
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        await sendChangeCardEmail(connection,user.name,user.email,dateTime);
        return {status: API_STATUS.SUCCESS,success: true,customerAddress: stripeCustomer.address,customerCard};
    }catch(e){
        switch(e.type){
            case 'StripeCardError':
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: e.message ? e.message : messages.error};
            case 'StripeInvalidRequestError':
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.invalidRequestError};
            default:
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.error};
        }
    }
}
const updateAddress = async(customerId,payload) => {
    let {street,city,state,zipcode} = payload;
    try{
        await stripe.customers.update(customerId,{address: {line1: street,city,state,postal_code: zipcode,country: "AU"}});
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        return {status: API_STATUS.SUCCESS,success: true,customerAddress: stripeCustomer.address};
    }catch(err){
        return {status: API_STATUS.PRECONDITION_FAILED,success: false,customerAddress: null};
    }
}
/**
 * Crerate Subscription
 * @param {*} connection 
 * @param {*} payload 
 * @param {*} user 
 * @param {*} membership 
 * @returns 
 */
const createSubscription = async(connection,payload,user,membership) => {
    let {first_name,last_name,phone,email,street,city,state,zip,card_holder_name,payment_id,membership_id} = payload;
    try{
        let customerId = user.stripe_customer_id;
        const fullName = (first_name + ' ' + last_name);
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        if(!customerId){
            const customer = await stripe.customers.create({name: fullName,email});
            customerId = customer.id;
            await updateData(connection,t.USERS,{stripe_customer_id: customerId,updated_at: dateTime},`id = ${user.id}`);
        }
        if(payment_id){
            const paymentMethod = await stripe.paymentMethods.retrieve(payment_id);
            const allPaymentMethods = await stripe.paymentMethods.list({customer: customerId,type: 'card'});
            let paymentMetholdId = null;
            if(allPaymentMethods.data){
                const data = allPaymentMethods.data;
                for(let i = 0;i < data.length;i++) {
                    if(paymentMethod.card.fingerprint == data[i].card.fingerprint){
                        paymentMetholdId = data[i].id;
                    }else{
                        await stripe.paymentMethods.detach(data[i].id);
                    }
                }
            }
            if(!paymentMetholdId){
                const attachedPaymentMethodwithCustomer = await stripe.paymentMethods.attach(payment_id,{customer: customerId});
                await stripe.customers.update(customerId,{invoice_settings: {default_payment_method: attachedPaymentMethodwithCustomer.id}});
            }else{
                await stripe.customers.update(customerId,{invoice_settings: {default_payment_method: paymentMetholdId}});
            }
            let planData = await stripe.plans.retrieve(membership.stripe_price_id,[]);
            let subscriptionData = {
                customer: customerId,
                items: [{price: membership.stripe_price_id}],
                expand: ['latest_invoice.payment_intent']
            }
            if(planData.interval && planData.interval_count){
                subscriptionData.backdate_start_date = moment().startOf('day').unix();
                subscriptionData.billing_cycle_anchor = moment().add(planData.interval_count,planData.interval).subtract(1,'d').endOf('day').unix();
            }
            let subscription = await stripe.subscriptions.create(subscriptionData);
            if(subscription.status == STRIPE_STATUS.ACTIVE || subscription.status == STRIPE_STATUS.TRIALING){
                const startDate = moment.unix(subscription.current_period_start).format("YYYY-MM-DD H:mm:ss");
                const endDate = moment.unix(subscription.current_period_end).format("YYYY-MM-DD H:mm:ss");
                let stateId = null;
                let cityId = null;
                if(state != null && state != ""){
                    stateId = await helpers.getStateByName(connection,state);
                    if(city != null && city != "" && stateId){
                        cityId = await helpers.getCityByName(connection,stateId,city);
                    }
                }
                let [transaction] = await getData(connection,t.TRANSACTIONS,'*',`user_id = ${user.id} AND status = "active" ORDER BY id DESC`);
                if(transaction){
                    let updateStatus = "update";
                    if(transaction.membership_id == 1){
                        updateStatus = "canceled";
                    }
                    await updateData(connection,t.TRANSACTIONS,{status: updateStatus,updated_at: dateTime},`id = ${transaction.id}`);
                    await sendChangePlanEmail(connection,user.name,user.email,dateTime);
                }
                await insertData(connection,t.TRANSACTIONS,{membership_id,user_id: user.id,first_name,last_name,phone,email,street,state_id: stateId,city_id: cityId,zip,stripe_transaction_id: subscription.id,response: JSON.stringify(subscription),status: subscription.status});
                let userParams = {
                    is_subscribed: 1,
                    membership_id,
                    stripe_start_date: startDate,
                    stripe_next_billing_date: endDate,
                    stripe_last_transaction_id: subscription.id,
                    stripe_subscription_end_date: null,
                    updated_at: dateTime
                }
                await updateData(connection,t.USERS,userParams,`id = ${user.id}`);
                await stripe.customers.update(customerId,{address: {line1: street,city,state,postal_code: zip,country: "AU"}});
                const [userObj] = await getData(connection,t.USERS,`*,IF(picture IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",picture)) as picture`,`id = ${user.id}`);
                const {roleCodes,roleNames} = await helpers.getUserRoles(connection,user.id);
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
                return {status: API_STATUS.SUCCESS,success: true,message: messages.stripe.subscribe,user: payload}
            }else{
                let errorMessage = messages.stripe.cardDenied;
                if(subscription.latest_invoice && subscription.latest_invoice.payment_intent){
                    console.log("===================== COMMON_LOGS STRIPE INVOICE ERROR ======== ", subscription.latest_invoice);
                    if(subscription.latest_invoice.payment_intent.last_payment_error){
                        console.log("===================== COMMON_LOGS STRIPE LAST PAYMENT ERROR ======== ", subscription.latest_invoice.payment_intent.last_payment_error);
                        if(subscription.latest_invoice.payment_intent.last_payment_error.message){                        
                            console.log("===================== COMMON_LOGS STRIPE LAST PAYMENT ERROR MESSAGE ERROR ======== ", subscription.latest_invoice.payment_intent.last_payment_error.message);
                            errorMessage = subscription.latest_invoice.payment_intent.last_payment_error.message;
                        }
                    }
                }
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: errorMessage};
            }
        }else{
            return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.failed};
        }
    }catch(e){
        switch(e.type){
            case 'StripeCardError':
              return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: e.message};
            case 'StripeInvalidRequestError':
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.invalidRequestError};
            default:
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.failure};
        }
    }
}
/**
 * Get User Cards
 * @param {*} customerId 
 * @returns 
 */
const getUserCards = async(customerId) => {
    try{
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        const paymentMethods = await stripe.paymentMethods.list({customer: customerId,type: 'card'});
        let defaultCard = paymentMethods.data[0];
        let card = {
            id: defaultCard.id,
            brand: defaultCard.card.brand,
            exp_month: defaultCard.card.exp_month,
            exp_year: defaultCard.card.exp_year,
            fingerprint: defaultCard.card.fingerprint,
            funding: defaultCard.card.funding,
            last4: defaultCard.card.last4
        }
        return {status: API_STATUS.SUCCESS,success: true,card,paymentMethods: paymentMethods.data,customerAddress: stripeCustomer.address};
    }catch(err){
        return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: err,paymentMethods: [],card: null,customerAddress: null};
    }
}
/**
 * Change Plan
 * @param {*} connection 
 * @param {*} payloadData 
 * @param {*} user 
 * @returns 
 */
const changePlan = async(payloadData,user,connection) => {
    const {membership} = payloadData;
    try{
        const subscriptionId = user.subscription_id;
        const memberships = await connection.queryAsync(`SELECT * FROM ${t.MEMBERSHIPS} WHERE id = ?`,[membership]);
        const member = memberships[0];
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        stripe.subscriptions.update(subscription.id,{
            cancel_at_period_end: false,
            proration_behavior: 'always_invoice',
            items: [{id: subscription.items.data[0].id,price: member.price_id}]
        });
        const currentDateTimeObj = await helpers.dateConvertToUTC();
        const dateTime = currentDateTimeObj.totalDate;
        await connection.queryAsync(`UPDATE ${t.USERS} SET membership_id = ?,updated_at = ? WHERE id = ?`, [member.id,dateTime,user.id]);
        const users = await connection.queryAsync(`SELECT *,IF(picture IS NULL,"",CONCAT("${c.AWSSNS.bucketBaseUrl}",picture)) as picture FROM ${t.USERS} WHERE id = ?`,[user.id]);
        user = users[0];
        const payload = {id: user.id,planName: member.name,planPrice: member.amount,googleId: user.google_id,membership: user.membership_id,category: user.category_id,userType: user.user_type,username: user.username,first_name: user.first_name,last_name: user.last_name,name: user.name,email: user.email,picture: user.picture,isSubscribed: user.is_subscribed};
        return {status: API_STATUS.SUCCESS,success: true,user: payload};
    }catch(err){
        return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: err};
    }
}

/**
 * Create charge
 * @param {*} charge 
 * @param {*} amount 
 * @returns 
 */
const createCharge = async (payment_id,amount,customerId,description = "") => {
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount: (amount * 100).toFixed(),
            currency: 'usd',
            payment_method: payment_id,
            confirmation_method: 'manual',
            confirm: true,
            customer: customerId,
            description: description || `Payment for Customer #${customerId}`
        });
        if(paymentIntent.status){
            return {status: API_STATUS.SUCCESS,success: true,data: paymentIntent};
        }else{
            return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.cardDenied};
        }
    }catch(e){
        switch(e.type){
            case 'StripeCardError':
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: e.message};
            case 'StripeInvalidRequestError':
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.invalidRequestError};
            default:
                return {status: API_STATUS.PRECONDITION_FAILED,success: false,message: messages.stripe.failure};
        }  
    }  
}

/**
 * Create refunds
 * @param {*} charge 
 * @param {*} amount 
 * @returns 
 */
const createRefund = async (charge,amount) => {
    try{
        const data = await stripe.refunds.create({charge: charge,amount: amount * 100});
        return {status: API_STATUS.SUCCESS,success: true,data};
    }catch(err){
        return {status: API_STATUS.SUCCESS,success: false};
    }  
}
/**
 * Cancel Subscription for these status: trialing, active, past_due, unpaid
 * @param {*} customerId 
 * @returns 
 */
const checkSubscriptionAndCancelPayment = async(customerId) => {
    try{
        const subscriptions = await stripe.subscriptions.list({customer: customerId});
        if(subscriptions && subscriptions.data){
            const data = subscriptions.data;
            for(let i = 0;i < data.length;i++){
                const element = data[i];
                if(["trialing","active","past_due","unpaid"].includes(element.status)){
                    await stripe.subscriptions.cancel(element.id);
                }
            }
        }
        return {status: API_STATUS.SUCCESS,success: true,subscriptions};
    }catch(err){
        return {status: API_STATUS.SUCCESS,success: false};    
    } 
}
const cancelSubscription = async(user,connection) => {
    try{
        const checkSubscription = await stripe.subscriptions.retrieve(user.stripe_last_transaction_id);
        if(!checkSubscription){
            return {status: API_STATUS.SUCCESS,success: false,message: messages.error};
        }
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        if(!checkSubscription.cancel_at_period_end){
            let subscriptionCancel = {};
            if(checkSubscription.schedule){
                await stripe.subscriptionSchedules.release(checkSubscription.schedule);
                subscriptionCancel = await stripe.subscriptions.update(checkSubscription.id,{cancel_at_period_end: true});
                await updateData(connection,t.TRANSACTIONS,{status: "canceled",updated_at: dateTime},`stripe_transaction_id = '${checkSubscription.id}' AND status = "upcoming"`);   
            }else{
                subscriptionCancel = await stripe.subscriptions.update(checkSubscription.id,{cancel_at_period_end: true});
                await updateData(connection,t.TRANSACTIONS,{status: "canceled",updated_at: dateTime},`user_id = ${user.id} AND status = "update"`);
            }
            if(subscriptionCancel){
                await updateData(connection,t.USERS,{stripe_next_billing_date: null,stripe_subscription_end_date: user.stripe_next_billing_date,updated_at: dateTime},`id = ${user.id}`);
                await cancelSubscriptionEmail(connection,user.name,user.email,dateTime);
            }else{
                return {status: API_STATUS.SUCCESS,success: false,message: messages.error};
            }
        }else{
            await updateData(connection,t.USERS,{stripe_next_billing_date: null,stripe_subscription_end_date: user.stripe_next_billing_date,updated_at: dateTime},`id = ${user.id}`);
            await cancelSubscriptionEmail(connection,user.name,user.email,dateTime);
        }
        return {status: API_STATUS.SUCCESS,success: true,message: messages.cancelSubscription};
    }catch(err){
        return null;    
    } 
}
module.exports = {
    generateCustomerID,
    changeCard,
    updateAddress,
    createSubscription,
    getUserCards,
    changePlan,
    createCharge,
    createRefund,
    checkSubscriptionAndCancelPayment,
    cancelSubscription
};