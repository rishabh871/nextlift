const messages = require("../constants/Messages");
const {API_STATUS} = require("../constants/Backend");
const phoneReg = /[6-9]{1}\d{9}/;
const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passReg = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const webRegix = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/im;

const profileValidate = async(req,res,next) => {
    let {first_name,last_name,phone,slogan,address,facebook,twitter,linkedin,instagram} = req.body;
    let errors = {};
    if(!first_name || !first_name.trim()){
        errors["first_name"] = messages.required;
    }else if(first_name.length > 100){
        errors["first_name"] = messages.max100CharAllow;
    }
    if(!last_name || !last_name.trim()){
        errors["last_name"] = messages.required;
    }else if(last_name.length > 100){
        errors["last_name"] = messages.max100CharAllow;
    }
    if(!phone){
        errors["phone"] = messages.required;
    }
    if(slogan && slogan.length > 255){
        errors["slogan"] = messages.max255CharAllow;
    }
    if(address && address.length > 255){
        errors["address"] = messages.max255CharAllow;
    }
    if(facebook && facebook.length > 50){
        errors["facebook"] = messages.max50CharAllow;
    }
    if(twitter && twitter.length > 50){
        errors["twitter"] = messages.max50CharAllow;
    }
    if(linkedin && linkedin.length > 50){
        errors["linkedin"] = messages.max50CharAllow;
    }
    if(instagram && instagram.length > 50){
        errors["instagram"] = messages.max50CharAllow;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const changePasswordValidate = async(req,res,next) => {
    let {old_password,password,confirm_password} = req.body;
    let errors = {};
    if(!old_password || !old_password.trim()){
        errors["old_password"] = messages.required;
    }else if(password.length > 30){
        errors["old_password"] = messages.max30CharAllow;
    }
    if(!password || !password.trim()){
        errors["password"] = messages.required;
    }else if(password.length > 30){
        errors["password"] = messages.max30CharAllow;
    }else if(!passReg.test(password.trim())){
        errors["password"] = messages.password;
    }
    if(!confirm_password || !confirm_password.trim()){
        errors["confirm_password"] = messages.required;
    }else if(confirm_password.length > 30){
        errors["confirm_password"] = messages.max30CharAllow;
    }
    if(old_password && password && old_password.trim() == password.trim()){
        errors["confirm_password"] = messages.confirmPassword;
    }
    if(old_password == password){
        errors["password"] = messages.oldPassword;
    }
    if(password && confirm_password && password.trim() != confirm_password.trim()){
        errors["confirm_password"] = messages.confirmPassword;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const cardValidate = async(req,res,next) => {
    let {card_holder_name,street,city,state,zipcode} = req.body;
    let errors = {};
    if(!card_holder_name || !card_holder_name.trim()){
        errors["card_holder_name"] = messages.required;
    }else if(card_holder_name.length > 100){
        errors["card_holder_name"] = messages.max100CharAllow;
    }
    if(!street){
        errors["street"] = messages.required;
    }else if(street.length > 255){
        errors["street"] = messages.max255CharAllow;
    }
    if(!city){
        errors["city"] = messages.required;
    }else if(city.length > 100){
        errors["city"] = messages.max100CharAllow;
    }
    if(!state){
        errors["state"] = messages.required;
    }
    if(!zipcode){
        errors["zipcode"] = messages.required;
    }else if(zipcode.length > 15){
        errors["zipcode"] = messages.max15CharAllow;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next(); 
}
const billingAddressValidate = async(req,res,next) => {
    let {street,city,state,zipcode} = req.body;
    let errors = {};
    if(!street){
        errors["street"] = messages.required;
    }else if(street.length > 255){
        errors["street"] = messages.max255CharAllow;
    }
    if(!city){
        errors["city"] = messages.required;
    }else if(city.length > 100){
        errors["city"] = messages.max100CharAllow;
    }
    if(!state){
        errors["state"] = messages.required;
    }
    if(!zipcode){
        errors["zipcode"] = messages.required;
    }else if(zipcode.length > 15){
        errors["zipcode"] = messages.max15CharAllow;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next(); 
}
const bySlugValidate = async(req,res,next) => {
    const {slug} = req.params;
    let errors = {};
    if(!slug){
        errors["slug"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const byIdValidate = async(req,res,next) => {
    const {id} = req.params;
    let errors = {};
    if(!id){
        errors["id"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const statusValidate = async(req,res,next) => {
    let {slug,status} = req.body;
    let errors = {};
    if(!slug){
        errors["slug"] = messages.required;
    }
    if(!status){
        errors["status"] = messages.required;
    }else if(status != "1" && status != "0"){
        errors["status"] = messages.invalidValue;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const userValidate = async(req,res,next) => {
    let {first_name,last_name,email} = req.body;
    let errors = {};
    if(!first_name || !first_name.trim()){
        errors["first_name"] = messages.required;
    }else if(first_name.length > 100){
        errors["first_name"] = messages.max100CharAllow;
    }
    if(!last_name || !last_name.trim()){
        errors["last_name"] = messages.required;
    }else if(last_name.length > 100){
        errors["last_name"] = messages.max100CharAllow;
    }
    if(!email || !email.trim()){
        errors["email"] = messages.required;
    }else if(email.length > 50){
        errors["email"] = messages.max50CharAllow;
    }else if(!emailReg.test(email)){
        errors["email"] = messages.invalidEmail;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const pageValidate = async(req,res,next) => {
    let {name,template} = req.body;
    let errors = {};
    if(!name || !name.trim()){
        errors["name"] = messages.required;
    }else if(name.length > 200){
        errors["name"] = messages.max200CharAllow;
    }
    if(!template){
        errors["template"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const linkValidate = async(req,res,next) => {
    let {slug,name} = req.body;
    let errors = {};
    if(!slug){
        errors["slug"] = messages.required;
    }
    if(!name || !name.trim()){
        errors["name"] = messages.required;
    }else if(name.length > 200){
        errors["name"] = messages.max200CharAllow;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const planValidate = async(req,res,next) => {
    let {name} = req.body;
    let errors = {};
    if(!name || !name.trim()){
        errors["name"] = messages.required;
    }else if(name.length > 200){
        errors["name"] = messages.max200CharAllow;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const faqValidate = async(req,res,next) => {
    let {question,answer,display_position} = req.body;
    let errors = {};
    if(!question || !question.trim()){
        errors["question"] = messages.required;
    }
    if(!answer || !answer.trim()){
        errors["answer"] = messages.required;
    }
    if(!display_position){
        errors["display_position"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const stopWordValidate = async(req,res,next) => {
    let {name} = req.body;
    let errors = {};
    if(!name || !name.trim()){
        errors["name"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const freePlanValidate = async(req,res,next) => {
    let {membership_id} = req.body;
    let errors = {};
    if(!membership_id){
        errors["membership_id"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const premiumPlanValidate = async(req,res,next) => {
    let {first_name,last_name,phone,email,street,city,state,zip,card_holder_name,payment_id,membership_id} = req.body;
    let errors = {};
    if(!first_name || !first_name.trim()){
        errors["first_name"] = messages.required;
    }else if(first_name.length > 100){
        errors["first_name"] = messages.max100CharAllow;
    }
    if(!last_name || !last_name.trim()){
        errors["last_name"] = messages.required;
    }else if(last_name.length > 100){
        errors["last_name"] = messages.max100CharAllow;
    }
    if(!phone){
        errors["phone"] = messages.required;
    }
    if(!email || !email.trim()){
        errors["email"] = messages.required;
    }else if(email.length > 50){
        errors["email"] = messages.max50CharAllow;
    }else if(!emailReg.test(email)){
        errors["email"] = messages.invalidEmail;
    }
    if(!street || !street.trim()){
        errors["street"] = messages.required;
    }else if(street.length > 200){
        errors["street"] = messages.max200CharAllow;
    }
    if(!city || !city.trim()){
        errors["city"] = messages.required;
    }else if(city.length > 200){
        errors["city"] = messages.max200CharAllow;
    }
    if(!state){
        errors["state"] = messages.required;
    }
    if(!zip){
        errors["zip"] = messages.required;
    }
    if(!card_holder_name || !card_holder_name.trim()){
        errors["card_holder_name"] = messages.required;
    }else if(card_holder_name.length > 100){
        errors["card_holder_name"] = messages.max100CharAllow;
    }
    if(!payment_id){
        errors["payment_id"] = messages.required;
    }
    if(!membership_id){
        errors["membership_id"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
module.exports = {
    profileValidate,
    changePasswordValidate,
    cardValidate,
    billingAddressValidate,
    bySlugValidate,
    byIdValidate,
    statusValidate,
    userValidate,
    pageValidate,
    linkValidate,
    planValidate,
    faqValidate,
    stopWordValidate,
    freePlanValidate,
    premiumPlanValidate
}