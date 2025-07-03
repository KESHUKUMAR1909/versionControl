const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: 'ap-south-1', 
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
const S3_BUCKET = 'gitbucket1909';

module.exports = { s3, S3_BUCKET };
