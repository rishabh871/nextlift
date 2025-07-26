if(process.env.NODE_ENV === "production"){
    module.exports = require("./backend-production.json");
}else{
    module.exports = require("./backend-dev.json");
}