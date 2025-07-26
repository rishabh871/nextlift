const axios = require('axios');
const moment = require("moment");
const momentTimezone = require("moment-timezone");
const {createTransport} = require("nodemailer");
const CryptoJS = require("crypto-js");
const path = require("path");
const fs = require("fs");
const {CRYPTO_SECRET_KEY,RECAPTCHA,SMTP} = require("../constants/Backend");
const t = require("../constants/Tables");
const messages = require("../constants/Messages");
const {getData,getDataByParams,insertData} = require("./QueryHelper");
const charMap = JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ṣ":"S","ṣ":"s","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\\"","”":"\\\"","„":"\\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}');

const handleException = async(e,res = null) => {
    let fileName = `error-${moment().format("YYYY-MM-DD")}.log`;
    let filePath = path.join(__dirname,"..","express-static","logs",fileName);
    const regex = /\((.*):(\d+):(\d+)\)$/
    const errorSplit = e.stack.split("\n")
    let lines = [];
    for(let i = 0;i < errorSplit.length;i++){
        const match = regex.exec(e.stack.split("\n")[i]);
        if(match){
            lines.push({filepath: match[1].split('\\').slice(-2).join('\\'),line: match[2],column: match[3]})
        }
    }
    const errorObj = {date: moment().format("YYYY-MM-DD H:mm:ss"),message: e.message,code: e.code,location: lines};
    fs.appendFile(filePath,JSON.stringify(errorObj) + `\n`,function(err){
        if(err){
            return console.log(err);
        }
    });
    if(res){
        if(e.code === "ER_PARSE_ERROR"){
            return res.status(500).send({status: 500,message: "Something went wrong. Please try again."});
        }else if(e.code === "ER_NO_SUCH_TABLE"){
            return res.status(500).send({status: 500,message: "Something went wrong. Please try again."});
        }else if(e.code === "ER_BAD_FIELD_ERROR"){
            return res.status(500).send({status: 500,message: "Something went wrong. Please try again."});
        }else if(e.code === "url_invalid"){
            return res.status(500).send({status: 500,message: e.message});
        }else{
            return res.status(500).send({status: 500,message: "Something went wrong. Please try again."});
        }
    }
    return;
}
const dateConvertToUTC = async(timeZone = "",date = "",time = "",days = 0,addMin = 0) => {
    if(!timeZone){
        timeZone = momentTimezone.tz.guess();
    }
    let conDate = moment.utc().add(days,"days").add(addMin,"minutes");
    let convertedDate = {year: "",date: "",time: "",totalDate: "",timestamp: ""};
    if(date && time){
        conDate = moment.tz(`${date} ${time}`,timeZone).utc().add(days,"days").add(addMin,"minutes");
    }else if(date){
        conDate = moment.tz(`${date}`,timeZone).utc().add(days,"days").add(addMin,"minutes");
    }
    convertedDate.year = conDate.format("YYYY");
    convertedDate.date = conDate.format("YYYY-MM-DD");
    convertedDate.time = conDate.format("HH:mm:ss");
    convertedDate.totalDate = convertedDate.date + " " + convertedDate.time;
    convertedDate.timestamp = conDate.unix();
    return convertedDate;
}
const validateCaptcha = async(token) => {
    try{
        const {data} = await axios.post(`${RECAPTCHA.SITE_VERIFY_URL}${RECAPTCHA.SECRET_KEY}&response=${token}`);
        if(data.success){
            return true;
        }
    }catch(e){
        return false;
    }
    return false;
}
let capitalizeName = async(str) => {
    const arr = str.trim().split(" ");
    for(var i=0;i<arr.length;i++){
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(" ");
}
const cryptoJSEncDec = async(id,type) => {
    let token = "";
    if(type == "enc"){
        token = CryptoJS.AES.encrypt(id,CRYPTO_SECRET_KEY).toString();
    }else{
        token = CryptoJS.AES.decrypt(id,CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8)
    }
    return token;
}
const getUserRoles = async(connection,userId) => {
    try{
        const getRoles = await getData(connection,`${t.USER_HAS_ROLES} as uhr LEFT JOIN ${t.ROLES} as r ON r.id = uhr.role_id`,`uhr.role_id,r.name,r.code`,`uhr.user_id = ${userId} AND r.is_deleted = 0`);
        if(getRoles.length){
            const roleIds = getRoles.map((item) => item.role_id.toString());
            const roleCodes = getRoles.map((item) => item.code);
            const roleNames = getRoles.map((item) => item.name);
            return {roleIds,roleCodes,roleNames,status:true,message:messages.success};
        }else{
            return {roleIds:[],roleCodes:[],roleNames:[],status:false,message:messages.error};
        }
    }catch(error){
        return {roleIds:[],roleCodes:[],roleNames:[],status:false,message:messages.error};
    }
}
let createPageSlug = async(connection,name,table,field,slug = "",count = 0) => {
    if(!slug){
        slug = await prepareSlugFromName(name);
    }
    let fieldSlug = `${slug}${((parseInt(count) > 0) ? '-'+parseInt(count) : '')}`;
    const [data] = await getData(connection,table,`*`,`${field} = "${fieldSlug}"`);
    if(data){
        let updatedCount = parseInt(count) + parseInt(1);
        return await createPageSlug(connection,name,table,field,slug,updatedCount);
    }else{
        return fieldSlug;
    }
}
let prepareSlugFromName = async(name) => {
    var slug = name.normalize().split('').reduce(function(result,ch){
        let appendChar = charMap[ch];
        if(appendChar === undefined){
            appendChar = ch;
        }
        return result + appendChar.replace(/[^\w\s$*_+~.()'"!\-:@]+/g,'');
    },'').replace(/[^A-Za-z0-9\s]/g,'').trim().replace(/\s+/g,'-').toLowerCase();
    slug = ((slug.length > 100) ? slug.substring(0,100) : slug);
    return slug;
}
let createSlug = async(connection,slug,table,field) => {
    let uniqueId = await uniqueSlug(slug);
    const [data] = await getData(connection,table,`*`,`${field} = "${uniqueId}"`);
    if(data){
        return await createSlug(connection,slug,table,field);
    }else{
        return uniqueId;
    }
}
let uniqueSlug = async(slug) => {
    let currDate = moment();
    let month = currDate.format("M");
    let day = currDate.format("D");
    let year = currDate.format("YYYY");
    let uniqueId = slug + month + day + year + Math.floor(Math.random() * 100000);
    return uniqueId;
}
let sendEmail = async(emails,subject,htmlBody,attachments = [],useCallback = false,callBackFunction = (_) => {}) => {
    let emailStatus = "failed";
    try{
        const transporter = createTransport({service: "gmail",auth: {user: SMTP.USER,pass: SMTP.PASS}});
        const toAddress = Array.isArray(emails) ? [...emails] : [emails];
        const mailObj = {
            from: SMTP.FROM,
            to: toAddress,
            subject: subject,
            html: htmlBody
        }
        if(attachments.length){
            mailObj.attachments = attachments;
        }
        await transporter.sendMail(mailObj);
        emailStatus = "sent";
    }catch(error){
        console.log("Error sending email:",error);
    }finally{
        if(useCallback){
            callBackFunction(emailStatus);
        }
    }
}
let getStateByName = async(connection,name) => {
    let stateId = null;
    let [stateData] = await getDataByParams(connection,t.STATES,'*',`name = ?`,[name]);
    if(stateData){
        stateId = stateData.id;
    }
    return stateId;
}
let getCityByName = async(connection,stateId,name) => {
    let cityId = null;
    let [cityData] = await getDataByParams(connection,t.CITIES,'*',`state_id = ? AND name = ?`,[stateId,name]);
    const dateTime = (await dateConvertToUTC()).totalDate;
    if(cityData){
        cityId = cityData.id;
    }else{
        cityId = (await insertData(connection,t.CITIES,{country_id: 1,state_id: stateId,name,created_at: dateTime,updated_at: dateTime})).insertId;
    }
    return cityId;
}
module.exports = {
    handleException,
    dateConvertToUTC,
    validateCaptcha,
    capitalizeName,
    cryptoJSEncDec,
    getUserRoles,
    createPageSlug,
    createSlug,
    sendEmail,
    getStateByName,
    getCityByName
}