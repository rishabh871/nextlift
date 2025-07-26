const messages = require("../constants/Messages");
const {API_STATUS} = require("../constants/Backend");
const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passReg = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const loginValidate = async(req,res,next) => {
    let {email,password} = req.body;
    let errors = {};
    if(!email || !email.trim()){
        errors["email"] = messages.required;
    }else if(email.length > 50){
        errors["email"] = messages.max50CharAllow;
    }else if(!emailReg.test(email)){
        errors["email"] = messages.invalidEmail;
    }
    if(!password || !password.trim()){
        errors["password"] = messages.required;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const forgotPasswordValidate = async(req,res,next) => {
    let {email} = req.body;
    let errors = {};
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
const resetPasswordValidate = async(req,res,next) => {
    let {token,password,confirm_password} = req.body;
    let errors = {};
    if(!token || !token.trim()){
        errors["token"] = messages.required;
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
    if(password && confirm_password && password.trim() != confirm_password.trim()){
        newError["confirm_password"] = messages.confirmPassword;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}
const registerValidate = async(req,res,next) => {
    let {first_name,last_name,email,password,confirm_password} = req.body;
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
    if(password && confirm_password && password.trim() != confirm_password.trim()){
        newError["confirm_password"] = messages.confirmPassword;
    }
    if(Object.keys(errors).length){
        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: errors});
    }
    return next();
}

module.exports = {
    loginValidate,
    forgotPasswordValidate,
    resetPasswordValidate,
    registerValidate
}