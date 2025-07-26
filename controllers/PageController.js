const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {API_STATUS,AWSSNS,DELETE_FLAG,STATUS_FLAG} = require("../constants/Backend");
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
            const data = await getDataByParams(connection,t.PAGES,`*`,conditionWithLimit,queryParams);
            const [allData] = await getDataByParams(connection,t.PAGES,`COUNT(id) as count`,conditions,queryParams);
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
        let connection,message,pageId,pageSlug = null;
        try{
            let {id,name,page_components,contact_email,contact_phone,contact_address,contact_is_map_visible,contact_map_url,meta_title,meta_description,template} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            name = await helpers.capitalizeName(name);
            page_components  = page_components ? page_components : [];
            contact_email = contact_email ? contact_email : null;
            contact_phone = contact_phone ? contact_phone : null;
            contact_address = contact_address ? contact_address : null;
            contact_is_map_visible = contact_is_map_visible ? true : false;
            contact_map_url = contact_map_url ? contact_map_url : null;
            meta_title = meta_title ? meta_title : null;
            meta_description = meta_description ? meta_description : null;
            template = template ? template : 'default';
            let pageObj = {name,page_components: JSON.stringify(page_components),contact_email,contact_phone,contact_address,contact_is_map_visible,contact_map_url,meta_title,meta_description,template,updated_at: dateTime}
            if(id){
                await updateData(connection,t.PAGES,pageObj,`id=${id}`);
                message = messages.pages.update;
                pageId = id;
            }else{
                pageObj.link = await helpers.createPageSlug(connection,name,t.PAGES,"link");
                pageObj.slug = await helpers.createSlug(connection,"P",t.PAGES,"slug");
                pageObj.created_at = dateTime;
                pageId = (await insertData(connection,t.PAGES,pageObj)).insertId;
                message = messages.pages.create;
                pageSlug = pageObj.slug;
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message,slug: pageSlug});
        }catch(e){
            console.log({e});
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
            const [page] = await getData(connection,t.PAGES,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!page){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.pages.notFound});
            }
            if(page.template != "contacts"){
                page.contact_email = "";
                page.contact_phone = "";
                page.contact_address = "";
                page.contact_is_map_visible = false;
                page.contact_map_url = "";
            }
            delete page.status;
            delete page.is_deleted;
            delete page.created_at;
            delete page.updated_at;
            delete page.deleted_at;
            page.page_components = page.page_components ? JSON.parse(page.page_components) : [];
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,page});
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
            const [page] = await getData(connection,t.PAGES,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!page){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.pages.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.PAGES,{status,updated_at:dateTime},`slug = '${slug}'`);
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
            const [page] = await getData(connection,t.PAGES,`*`,`slug = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
            if(!page){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.pages.notFound});
            }
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            await updateData(connection,t.PAGES,{is_deleted: DELETE_FLAG.TRUE,updated_at: dateTime},`slug = '${slug}'`);
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.pages.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    },
    webPage: async function(req,res){
        let connection;
        try{
            let {slug} = req.params;
            connection = await db.getConnectionAsync();
            const [page] = await getData(connection,t.PAGES,`*`,`link = '${slug}' AND is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE}`);
            if(!page){
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.pages.notFound});
            }
            delete page.status;
            delete page.is_deleted;
            delete page.created_at;
            delete page.updated_at;
            delete page.deleted_at;
            page.page_components = page.page_components ? JSON.parse(page.page_components) : [];
            if(slug == "home"){
                page.faqs = await getData(connection,t.FAQS,`id,question,answer`,`is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE} ORDER BY display_position ASC LIMIT 0,8`);
            }else if(page.template == "faqs"){
                page.faqs = await getData(connection,t.FAQS,`id,question,answer`,`is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE} ORDER BY display_position ASC`);
            }else if(page.template == "pricing"){
                page.memberships = await getData(connection,t.MEMBERSHIPS,`id,name,price,type,IF(banner IS NULL,"",CONCAT("${AWSSNS.bucketBaseUrl}",banner)) as banner,description,is_free`,`is_deleted = ${DELETE_FLAG.FALSE} AND status = ${STATUS_FLAG.ACTIVE} ORDER BY position ASC`);
            }
            res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,page});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}