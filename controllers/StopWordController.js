const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {API_STATUS,DELETE_FLAG} = require("../constants/Backend");
const {getData,getDataByParams,insertData,updateData} = require("../helpers/QueryHelper");

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
            orderBy = `ORDER BY ${column} ${dir}`;
            connection = await db.getConnectionAsync();
            let conditions = `is_deleted = ${DELETE_FLAG.FALSE}`;
            if(query.length > 0){
                conditions += " AND (name LIKE ?)";
                queryParams.push(`%${query}%`);
            }
            if(limit != -1){
                const offset = (parseInt(page) - 1) * parseInt(limit);
                conditionWithLimit = `${conditions} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
            }else{
                conditionWithLimit = `${conditions} ${orderBy}`;
            }
            const data = await getDataByParams(connection,t.STOP_WORDS,`*`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,t.STOP_WORDS,`COUNT(id) as count`,conditions,queryParams);
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
    },
    addUpdate: async function(req,res){
        let connection,message;
        try{
            let {id,name} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            name = name ? name : null;
            let stopWordObj = {name,updated_at: dateTime}
            if(id){
                await updateData(connection,t.STOP_WORDS,stopWordObj,`id=${id}`);
                message = messages.stopWords.update;
            }else{
                stopWordObj.created_at = dateTime;
                await insertData(connection,t.STOP_WORDS,stopWordObj);
                message = messages.stopWords.create;
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    delete: async function(req,res){
        let connection;
        try{
            let {id} = req.params;
            connection = await db.getConnectionAsync();
            const [stopWord] = await getData(connection,t.STOP_WORDS,`id`,`id = ${id} AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!stopWord){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.stopWords.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.STOP_WORDS,{is_deleted: DELETE_FLAG.TRUE,updated_at: dateTime},`id = ${id}`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.stopWords.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}