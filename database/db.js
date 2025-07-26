let mysql = require("mysql");
const Promise = require("bluebird");
const config = require("../config/backend").DB;
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
const pool = mysql.createPool(config);
module.exports = pool;