const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {API_STATUS,DELETE_FLAG} = require("../constants/Backend");
const {getData,getDataByParams} = require("../helpers/QueryHelper");

module.exports = {
    lists: async function(req,res){
        let connection,orderBy,conditionWithLimit,queryParams = [];
        try{
            let {query,page,limit,column,dir} = req.query;
            query = query ? query.trim() : "";
            page = page ? page : 1;
            limit = limit ? limit : 10;
            column = column ? column : "id";
            dir = dir ? dir : "DESC";
            if(column){
                if(column == "id"){
                    column = "t.id";
                }else if(column == "membership_name"){
                    column = "m.name";
                }else if(column == "user_name"){
                    column = "u.name";
                }else if(column == "phone"){
                    column = "t.phone";
                }else if(column == "email"){
                    column = "t.email";
                }else if(column == "street"){
                    column = "t.street";
                }else if(column == "state_name"){
                    column = "s.name";
                }else if(column == "city_name"){
                    column = "c.name";
                }else if(column == "zip"){
                    column = "t.zip";
                }else if(column == "status"){
                    column = "t.status";
                }
                orderBy = `ORDER BY ${column} ${dir}`;
            }
            connection = await db.getConnectionAsync();
            let conditions = `t.is_deleted = ${DELETE_FLAG.FALSE}`;
            if(query.length > 0){
                conditions += " AND (m.name LIKE ? OR u.name LIKE ? OR t.phone LIKE ? OR t.email LIKE ? OR t.street LIKE ? OR s.name LIKE ? OR c.name LIKE ? OR t.zip LIKE ? OR t.status LIKE ?)";
                queryParams.push(`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`);
            }
            if(limit != -1){
                const offset = (parseInt(page) - 1) * parseInt(limit);
                conditionWithLimit = `${conditions} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
            }else{
                conditionWithLimit = `${conditions} ${orderBy}`;
            }
            let tableWithJoin = `${t.TRANSACTIONS} AS t 
            LEFT JOIN ${t.USERS} AS u ON t.user_id = u.id
            LEFT JOIN ${t.MEMBERSHIPS} AS m ON t.membership_id = m.id
            LEFT JOIN ${t.STATES} AS s ON t.state_id = s.id
            LEFT JOIN ${t.CITIES} AS c ON t.city_id = c.id`;
            const data = await getDataByParams(connection,tableWithJoin,`t.id,m.name as membership_name,u.name as user_name,t.phone,t.email,t.street,s.name as state_name,c.name as city_name,t.stripe_transaction_id,t.status,t.created_at`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,tableWithJoin,`COUNT(t.id) as count`,conditions,queryParams);
            let current = parseInt(page);
            let totalPages = Math.ceil(allData.count/limit);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,resData: {data,current,totalData: allData.count,totalPages}});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}