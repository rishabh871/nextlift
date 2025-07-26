const {APP_NAME,BASE_URL} = require("../constants/Backend");
const {EMAIL_LOGS} = require("../constants/Tables");
const {insertData} = require("./QueryHelper");
const emailHeader = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:540px;border:2px solid #f3f3f3;text-align:left;font-family:sans-serif;"><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="width:100%!important"><tr><td width="100%" style="vertical-align:top;text-align:left;padding:15px 20px 10px;border-bottom:5px solid #1AA897"><a href="${BASE_URL}" target="_blank"><img src="${BASE_URL}/assets/images/logo.png" alt="${APP_NAME}" style="width:250px;"></a></td></tr>`;
const emailFooter = `<tr><td style="padding:0 20px 20px;font-size:14px;">Best regards,<br/>${APP_NAME}</td></tr><tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr><td colspan="2" style="color:#2E4151;font-size:12px;padding:5px 6px 5px 6px;text-align:center;background:#f9f9f9">Copyright &copy; ${new Date().getFullYear()} ${APP_NAME} | All rights Reserved.</td></tr></table></td></tr></table></td></tr></table>`;

const forgotPasswordMail = async(connection,name,email,token,dateTime) => {
    const subject = `${APP_NAME} - Password Reset Requested for Your Nextlift Account`;
    const html_body = `${emailHeader}<tr><td style="padding:20px 20px 10px;font-size:14px;">Dear ${name},</td></tr><tr><td style="padding:0 20px;font-size:14px;">We received a request to reset the password for your Nextlift account. If you made this request, please click the link below:</td></tr><tr><td style="padding:10px 20px;font-size:14px;"><a style="cursor:pointer;padding:0 20px;background-color:#1AA897;color:#fff;line-height:40px;font-size:15px;display:inline-block;text-decoration:none;" target="_blank;" href="${BASE_URL}/reset/${token}">RESET PASSWORD</a></td></tr><tr><td style="padding:0 20px 10px;font-size:14px;">If you didn't make this request, please ignore this email or contact our support team if you believe this is an error.</td></tr>${emailFooter}`;
    return await insertData(connection,EMAIL_LOGS,{email,subject,html_body,type: "forgot-password",created_at: dateTime,updated_at: dateTime});
}
const registerMail = async(connection,name,email,password,dateTime) => {
    const subject = `Welcome to Nextlift!`;
    const html_body = `${emailHeader}<tr><td style="padding:20px 20px 10px;font-size:14px;">Dear ${name},</td></tr><tr><td style="padding:0 20px 20px;font-size:14px;">We're thrilled to have you on board and can't wait for you to get started. Here at Nextlift, we are committed to providing you with the best experience possible, and we are excited to have you as a part of our community.</td></tr><tr><td style="padding:10px;font-size:20px;line-height:20px;color:#424242;background:#f6f6f6;text-align:center">Your Account Details:</td></tr><tr><td style="padding:5px 20px 20px;line-height:20px;color:#626262"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="30%" style="color:#626262;font-size:14px;vertical-align:top;line-height:20px;padding:5px">Email: </td><td width="70%" style="color:#222222;font-size:14px;vertical-align:top;line-height:20px;padding:5px">${email}</td></tr><tr><td width="30%" style="color:#626262;font-size:14px;vertical-align:top;line-height:20px;padding:5px">Password: </td><td width="70%" style="color:#222222;font-size:14px;vertical-align:top;line-height:20px;padding:5px">${password}</td></tr><tr><td width="30%" style="color:#626262;font-size:14px;vertical-align:top;line-height:20px;padding:5px">Link: </td><td width="70%" style="color:#222222;font-size:14px;vertical-align:top;line-height:20px;padding:5px"><a href="${BASE_URL}" target="_blank">${BASE_URL}</a></td></tr></tbody></table></td></tr>${emailFooter}`;
    return await insertData(connection,EMAIL_LOGS,{email,subject,html_body,type: "register",created_at: dateTime,updated_at: dateTime});
}
const sendChangePlanEmail = async(connection,name,email,dateTime) => {
    const subject = `Your ${APP_NAME} Plan has been Successfully Updated`;
    const html_body = `${emailHeader}<tr><td style="padding:20px 20px 10px;font-size:14px;">Dear ${name},</td></tr><tr><td style="padding:0 20px;font-size:14px;">We're writing to let you know that your KB3 Sports plan has been successfully updated. Log in to your account for more details.</td></tr><tr><td style="padding:10px 20px;font-size:14px;">If you did not request this change or have any questions, please contact our support team.</td></tr>${emailFooter}`;
    return await insertData(connection,EMAIL_LOGS,{email,subject,html_body,type: "change-plan",created_at: dateTime,updated_at: dateTime});
}
const cancelSubscriptionEmail = async(connection,name,email,dateTime) => {
    const subject = `Confirmation of Your ${APP_NAME} Subscription Cancellation`;
    const html_body = `${emailHeader}<tr><td style="padding:20px 20px 10px;font-size:14px;">Dear ${name},</td></tr><tr><td style="padding:0 20px 10px;font-size:14px;">We're sorry to see you go. Your subscription to ${APP_NAME} has been canceled per your request. If you have any feedback or if there's anything we can do to improve your experience, we'd love to hear from you.</td></tr>${emailFooter}`;
    return await insertData(connection,EMAIL_LOGS,{email,subject,html_body,type: "cancel-subscription",created_at: dateTime,updated_at: dateTime});
}
const sendChangeCardEmail = async(connection,name,email,dateTime) => {
    const subject = `Your ${APP_NAME} Payment Method Has Been Updated`;
    const html_body = `${emailHeader}<tr><td style="padding:20px 20px 10px;font-size:14px;">Dear ${name},</td></tr><tr><td style="padding:0 20px 10px;font-size:14px;">This is to inform you that your payment method on file has been successfully updated. The new method will be used for future transactions. If you did not make this change or have any questions, please contact our support team.</td></tr>${emailFooter}`;
    return await insertData(connection,EMAIL_LOGS,{email,subject,html_body,type: "change-card",created_at: dateTime,updated_at: dateTime});
}
module.exports = {
    forgotPasswordMail,
    registerMail,
    sendChangePlanEmail,
    cancelSubscriptionEmail,
    sendChangeCardEmail
}