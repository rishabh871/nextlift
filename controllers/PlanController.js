const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {API_STATUS,AWSSNS,DELETE_FLAG} = require("../constants/Backend");
const {getData,getDataByParams,insertData,updateData} = require("../helpers/QueryHelper");
const {uploadFileToBucket,deleteFileFromBucket} = require("../helpers/Buckets");

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
                conditions += " AND (name LIKE ? OR description LIKE ? OR price LIKE ?)";
                queryParams.push(`%${query}%`,`%${query}%`,`%${query}%`);
            }
            if(limit != -1){
                const offset = (parseInt(page) - 1) * parseInt(limit);
                conditionWithLimit = `${conditions} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
            }else{
                conditionWithLimit = `${conditions} ${orderBy}`;
            }
            const data = await getDataByParams(connection,t.MEMBERSHIPS,`id,slug,name,stripe_price_id,price,type,position,IF(banner IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",banner)) as banner,is_free,status`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,t.MEMBERSHIPS,`COUNT(id) as count`,conditions,queryParams);
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
        let connection,message,planId;
        try{
            let {id,name,stripe_product_id,stripe_price_id,price,type,position,description,is_free,deleteBanner} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            name = await helpers.capitalizeName(name);
            stripe_product_id = stripe_product_id ? stripe_product_id : null;
            stripe_price_id = stripe_price_id ? stripe_price_id : null;
            price = price ? price : 0;
            type = type ? type : null;
            position = position ? position : 1;
            description = description ? description : null;
            is_free = is_free ? true : false;
            deleteBanner = ((deleteBanner && deleteBanner == "1") ? true : false);
            let planObj = {name,stripe_product_id,stripe_price_id,price,type,position,description,is_free,updated_at: dateTime}
            if(id){
                await updateData(connection,t.MEMBERSHIPS,planObj,`id=${id}`);
                message = messages.plans.update;
                planId = id;
            }else{
                planObj.slug = await helpers.createSlug(connection,"P",t.MEMBERSHIPS,"slug");
                planObj.created_at = dateTime;
                planId = (await insertData(connection,t.MEMBERSHIPS,planObj)).insertId;
                message = messages.plans.create;
            }
            if(deleteBanner || (req.files && req.files.banner)){
                const [deleteBannerObj] = await getData(connection,t.MEMBERSHIPS,`banner`,`id = ${planId}`);
                if(deleteBannerObj && deleteBannerObj.banner){
                    await deleteFileFromBucket(deleteBannerObj.banner);
                    await updateData(connection,t.MEMBERSHIPS,{banner: null},`id = ${planId}`);
                }
            }
            if(req.files && req.files.banner){
                let {banner} = req.files;
                let uploadFile = await uploadFileToBucket(banner,"membership/");
                await updateData(connection,t.MEMBERSHIPS,{banner: uploadFile.fileUrl},`id = ${planId}`);
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
            const [membership] = await getData(connection,t.MEMBERSHIPS,`*,IF(banner IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",banner)) as banner`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!membership){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.plans.notFound});
            }
            delete membership.is_deleted;
            delete membership.updated_at;
            delete membership.deleted_at;
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,membership});
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
            const [membership] = await getData(connection,t.MEMBERSHIPS,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!membership){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.plans.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.MEMBERSHIPS,{status,updated_at:dateTime},`slug = '${slug}'`);
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
            const [membership] = await getData(connection,t.MEMBERSHIPS,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!membership){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.plans.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.MEMBERSHIPS,{is_deleted: DELETE_FLAG.TRUE,updated_at: dateTime},`slug = '${slug}'`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.plans.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}