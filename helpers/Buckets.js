const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const AWS = require("aws-sdk");
const {AWSSNS} = require("../constants/Backend");
AWS.config.update({accessKeyId: AWSSNS.accessKeyId,secretAccessKey: AWSSNS.secretAccessKey,region: AWSSNS.region,acl: "public-read"});

const uploadFileToBucket = async(file,path) => {
    try{
        const s3 = new AWS.S3({accessKeyId: AWSSNS.accessKeyId,secretAccessKey: AWSSNS.secretAccessKey});
        const ext = file.name.split('.').pop();
        const fileNameNew = `${new Date().getTime()}-${crypto.randomBytes(16).toString('hex')}.${ext}`;
        const tmpPath = `${path}${fileNameNew}`;
        const params = {Bucket: AWSSNS.bucketName,Key: tmpPath,Body: file.data,ContentType: file.mimetype};
        const res = await new Promise((resolve,reject) => {
            s3.upload(params,(err,data) => err == null ? resolve(data) : reject(err));
        });
        return {fileUrl: res.Key,Location: res.Location};
    }catch(error){
    }
}
const deleteFileFromBucket = async(file) => {
    try{
        if(!file){
            return {isDeleted: true};
        }
        const s3 = new AWS.S3({accessKeyId: AWSSNS.accessKeyId,secretAccessKey: AWSSNS.secretAccessKey});
        const params = {Bucket: AWSSNS.bucketName,Key: file};
        const res = await new Promise((resolve,reject) => {
            s3.deleteObject(params,(err,data) => err == null ? resolve(data) : reject(err));
        });
        return {isDeleted: res};
    }catch(error){
    }
}
const downloadImage = async(url,destination) => {
    const writer = fs.createWriteStream(destination);
    const response = await axios({url: url,method: "GET",responseType: "stream"});
    response.data.pipe(writer);
    return new Promise((resolve,reject) => {
        writer.on("finish",resolve);
        writer.on("error",reject);
    });
}
module.exports = {
    uploadFileToBucket,
    deleteFileFromBucket,
    downloadImage
}