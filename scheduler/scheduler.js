const cron = require("node-cron");
const {removeLogsScript,emailScript} = require("./jobs");

/**
 * Run cron job every day at 2 AM (PST)
 */
const removeLogsCron = cron.schedule("0 2 * * *",async() => {
    try{
        removeLogsScript().then()
    }catch(error){}
},{scheduled: true,timezone: "America/chicago"});

/**
 * Run cron job Every 3 Second
 */
const emailCron = cron.schedule("*/3 * * * * *",async() => {
    try{
        emailScript().then()
    }catch(error){}
},{scheduled: true,timezone: "America/chicago"});

module.exports = {
    removeLogsCron,
    emailCron
}