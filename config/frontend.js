if(process.env.NODE_ENV === "production"){
    module.exports = require("./frontend-production.json");
}else{
    module.exports = require("./frontend-dev.json");
}