const moment = require("moment");
const fs = require("fs");
const path = require("path");
const db = require("../../database/db");
const t = require("../../constants/Tables");
const {CRON_EMAILS,LOGS_DAYS} = require("../../constants/Backend");
const helpers = require("../../helpers/Common");
const {getData,updateData} = require("../../helpers/QueryHelper");

/**
 * Remove Logs Script 
 */
const removeLogsScript = async() => {
    try{
        const logPath = path.join(__dirname,"..","..","express-static","logs");
        fs.readdir(logPath,function(err,files){
            if(err){
                return console.log("Unable to scan directory: " + err);
            }
            files.forEach(function(file){
                if(file != ".gitignore"){
                    let fileDate = file.replace("error-","").replace(".log","");
                    fileDate = moment(fileDate,"YYYY-MM-DD");
                    var diff = moment().diff(fileDate,"days");
                    if(diff >= LOGS_DAYS){
                        fs.unlinkSync(`${logPath}/${file}`);
                    }
                }
            });
        });
    }catch(e){
        console.log(e.message);
    }
}

/**
 * Send Email script
 */
const emailScript = async() => {
    let connection;
    try{
        connection = await db.getConnectionAsync();
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        const emailLogs = await getData(connection,t.EMAIL_LOGS,`id`,`(status IS NULL OR status = "failed") LIMIT 0,${CRON_EMAILS.PER_SECONDS}`);
        if(emailLogs.length){
            for(let i = 0;i < emailLogs.length;i++){
                let [emailLog] = await getData(connection,t.EMAIL_LOGS,`*`,`id = ${emailLogs[i].id} AND (status IS NULL OR status = "failed")`);
                if(emailLog){
                    await helpers.sendEmail(emailLog.email,emailLog.subject,emailLog.html_body,[],true,async(emailStatus) => {
                        if(emailStatus == "sent"){
                            await updateData(connection,t.EMAIL_LOGS,{status: "sent",updated_at: dateTime},`id = ${emailLog.id}`);
                        }else if(emailStatus == "failed"){
                            let status = "failed";
                            let failedCount = (parseInt(emailLog.failed_count || 0) + parseInt(1));
                            if(failedCount >= 2){
                                status = "retry";
                            }
                            await updateData(connection,t.EMAIL_LOGS,{status,failed_count: failedCount,updated_at: dateTime},`id = ${emailLog.id}`);
                        }
                    });
                }
            }
        }
    }catch(e){
        console.log(e.message);
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    removeLogsScript,
    emailScript
}