const db = require("../database/db");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const messages = require("../constants/Messages");
const {AWSSNS,API_STATUS} = require("../constants/Backend");
const {getData,insertData,deleteData} = require("../helpers/QueryHelper");
const {uploadFileToBucket,deleteFileFromBucket} = require("../helpers/Buckets");

module.exports = {
    upload: async function(req,res){
        let connection;
        try{
            const {type} = req.body;
            connection = await db.getConnectionAsync();
            const dateTime = (await helpers.dateConvertToUTC()).totalDate;
            if(req.files && req.files.media){
                const path = `media/`;
                const {media} = req.files;
                let uploadObj = await uploadFileToBucket(media,path);
                let fileSize = parseFloat(media.size / (1024 * 1024)).toFixed(2);
                let mediaObj = {media: uploadObj.fileUrl,media_type: type,media_size: fileSize,created_at: dateTime,updated_at: dateTime};
                await insertData(connection,t.MEDIA,mediaObj);
                let mediaUrl = AWSSNS.bucketBaseUrl + uploadObj.fileUrl;
                return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.success,mediaUrl});
            }else{
                return res.status(API_STATUS.UNPROCESSABLE_ENTITY).send({status: API_STATUS.UNPROCESSABLE_ENTITY,errors: {media: messages.required}});
            }
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
            const {mediaId} = req.params;
            connection = await db.getConnectionAsync();
            const [attachment] = await getData(connection,t.MEDIA,`id,media`,`id = ${mediaId}`);
            if(!attachment){
                return res.status(API_STATUS.PRECONDITION_FAILED).send({status: API_STATUS.PRECONDITION_FAILED,message: messages.media.notFound});
            }
            await deleteFileFromBucket(attachment.media);
            await deleteData(connection,t.MEDIA,`id = ${mediaId}`);
            return res.status(API_STATUS.SUCCESS).send({status: API_STATUS.SUCCESS,message: messages.media.delete});
        }catch(e){
            helpers.handleException(e,res);
        }finally{
            if(connection){
                connection.release();
            }
        }
    }
}