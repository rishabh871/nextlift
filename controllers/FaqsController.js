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
                conditions += " AND (question LIKE ?)";
                queryParams.push(`%${query}%`);
            }
            if(limit != -1){
                const offset = (parseInt(page) - 1) * parseInt(limit);
                conditionWithLimit = `${conditions} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
            }else{
                conditionWithLimit = `${conditions} ${orderBy}`;
            }
            const data = await getDataByParams(connection,t.FAQS,`*`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,t.FAQS,`COUNT(id) as count`,conditions,queryParams);
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
            let {id,question,answer,display_position} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            question = question ? question : null;
            answer = answer ? answer : null;
            display_position = display_position ? display_position : null;
            let faqObj = {question,answer,display_position,updated_at: dateTime}
            if(id){
                await updateData(connection,t.FAQS,faqObj,`id=${id}`);
                message = messages.faqs.update;
            }else{
                faqObj.slug = await helpers.createSlug(connection,"F",t.FAQS,"slug");
                faqObj.created_at = dateTime;
                await insertData(connection,t.FAQS,faqObj);
                message = messages.faqs.create;
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
    view: async function(req,res){
        let connection;
        try{
            let {slug} = req.params;
            connection = await db.getConnectionAsync();
            const [faq] = await getData(connection,t.FAQS,`*`,`slug="${slug}" AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!faq){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.faqs.notFound});
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,faq});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    status: async function(req,res){
        let connection;
        try{
            let {slug,status} = req.body;
            connection = await db.getConnectionAsync();
            const [faq] = await getData(connection,t.FAQS,`id`,`slug="${slug}" AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!faq){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.faqs.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.FAQS,{status,updated_at: dateTime},`slug="${slug}"`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success});
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
            let {slug} = req.params;
            connection = await db.getConnectionAsync();
            const [faq] = await getData(connection,t.FAQS,`id`,`slug="${slug}" AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!faq){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.faqs.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.FAQS,{is_deleted: DELETE_FLAG.TRUE,updated_at: dateTime},`slug="${slug}"`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.faqs.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}