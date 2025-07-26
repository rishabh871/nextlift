const bcrypt = require("bcryptjs");
const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {registerMail} = require("../helpers/Emails");
const {API_STATUS,DELETE_FLAG,ROLES,SALT_ROUNDS} = require("../constants/Backend");
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
            if(column){
                if(column == "id"){
                    column = "u.id";
                }else if(column == "name"){
                    column = "u.name";
                }else if(column == "first_name"){
                    column = "u.first_name";
                }else if(column == "last_name"){
                    column = "u.last_name";
                }else if(column == "email"){
                    column = "u.email";
                }else if(column == "phone"){
                    column = "u.phone";
                }
                orderBy = `ORDER BY ${column} ${dir}`;
            }
            connection = await db.getConnectionAsync();
            let conditions = `u.is_deleted = ${DELETE_FLAG.FALSE} AND ur.role_id = ${ROLES.USER.id}`;
            if(query.length > 0){
                conditions += " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
                queryParams.push(`%${query}%`,`%${query}%`,`%${query}%`,`%${query}%`);
            }
            if(limit != -1){
                const offset = (parseInt(page) - 1) * parseInt(limit);
                conditionWithLimit = `${conditions} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
            }else{
                conditionWithLimit = `${conditions} ${orderBy}`;
            }
            let tableWithJoin = `${t.USERS} AS u LEFT JOIN ${t.USER_HAS_ROLES} AS ur ON u.id = ur.user_id`;
            const data = await getDataByParams(connection,tableWithJoin,`u.*`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,tableWithJoin,`COUNT(u.id) as count`,conditions,queryParams);
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
            let {id,first_name,last_name,phone,email,password} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            first_name = await helpers.capitalizeName(first_name);
            last_name = await helpers.capitalizeName(last_name);
            phone = phone ? phone : null;
            email = email ? email : null;
            password = password ? password : null;
            const name = `${first_name} ${last_name}`;
            let userObj = {first_name,last_name,name,phone,email,updated_at: dateTime}
            if(id){
                if(phone){
                    const [checkUserPhone] = await getData(connection,t.USERS,`id`,`phone="${phone}" AND id != ${id}`);
                    if(checkUserPhone){
                        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {phone: messages.phoneExists}});
                    }
                }
                const [checkUserEmail] = await getData(connection,t.USERS,`id`,`email="${email}" AND id != ${id}`);
                if(checkUserEmail){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: messages.emailExists}});
                }
                await updateData(connection,t.USERS,userObj,`id=${id}`);
                message = messages.users.update;
            }else{
                if(phone){
                    const [checkUserPhone] = await getData(connection,t.USERS,`id`,`phone="${phone}"`);
                    if(checkUserPhone){
                        return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {phone: messages.phoneExists}});
                    }
                }
                const [checkUserEmail] = await getData(connection,t.USERS,`id`,`email="${email}"`);
                if(checkUserEmail){
                    return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {email: messages.emailExists}});
                }
                const hash = bcrypt.hashSync(password,SALT_ROUNDS);
                userObj.slug = await helpers.createSlug(connection,"U",t.USERS,"slug");
                userObj.password = hash;
                userObj.created_at = dateTime;
                const userId = (await insertData(connection,t.USERS,userObj)).insertId;
                await insertData(connection,t.USER_HAS_ROLES,{user_id: userId,role_id: ROLES.USER.id});
                message = messages.users.create;
                await registerMail(connection,name,email,password,dateTime);
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
    status: async function(req,res){
        let connection;
        try{
            let {slug,status} = req.body;
            connection = await db.getConnectionAsync();
            const [user] = await getData(connection,t.USERS,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.USERS,{status,updated_at:dateTime},`slug = '${slug}'`);
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
            const [user] = await getData(connection,t.USERS,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!user){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.users.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.USERS,{is_deleted: DELETE_FLAG.TRUE,updated_at: dateTime},`slug = '${slug}'`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.users.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}