const dev = process.env.NODE_ENV !== "production";
const app = require("next")({dev});
const express = require("express");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
require("./scheduler/scheduler");
Promise.promisifyAll(jwt);
app.prepare().then(() => {
    const frontendConfig = require("./config/frontend");
    const backendConfig = require("./config/backend");

    if(!backendConfig.PORT){
        throw new Error("PORT is required in config File");
    }
    if(!frontendConfig.BASE){
        throw new Error("BASE url is required in config File");
    }
    if(!backendConfig.DB){
        throw new Error("DB credentials are required in config File");
    }
    if(!backendConfig.DB.connectionLimit){
        throw new Error("DB.connectionLimit is required in config File");
    }
    if(!backendConfig.DB.host){
        throw new Error("DB.host is required in config File");
    }
    if(!backendConfig.DB.user){
        throw new Error("DB.user is required in config File");
    }
    if(!backendConfig.DB.password && !dev){
        throw new Error("DB.password is required in config File");
    }
    if(!backendConfig.DB.database){
        throw new Error("DB.database is required in config File");
    }
    const server = new express();
    require("./routes/middleware")({server,app,dev});
    server.use("/api/v1",require("./routes/api"));
    server.use("/auth/v1",require("./routes/auth"));
    server.use("/v1",require("./routes/chatbot"));
    server.use(express.static("express-static"));
    require("./routes/backend")({server,app,dev});
    require("./routes/frontend")({server,app,dev});

    let http = require("http").Server(server);
    const PORT = backendConfig.PORT;
    http.listen(PORT);
    const ENV = process.env.NODE_ENV || "dev";
    console.log("* * * * * * * * * * *");
    console.log("* Nextlift Started  *");
    console.log(`* PORT: ${PORT} ${" ".repeat(11 - PORT.toString().length)}*`);
    console.log(`* ENV : ${ENV} ${" ".repeat(11 - ENV.length)}*`);
    console.log("* * * * * * * * * * *");
}).catch((e) => {
    console.log("* * * ERROR * * *");
    console.log(e);
    console.log(e.message);
    console.log("* * * ERROR * * *");
    process.exit(1);
});