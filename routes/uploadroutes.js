const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const uuid = require('uuid');
const auth =require('../middleware/auth');
const config = require('config');

const s3 = new AWS.S3({
	//accessKeyId:config.get('AWSAccessKey'),
	//secretAccessKey:config.get('AWSSecretKey'),
	signatureVersion:'v4',
	region: 'ap-south-1'
});

router.get('/',auth,async(req,res)=>{
		const key = `${req.user._id}/${uuid.v1()}.jpeg`;
		s3.getSignedUrl('putObject',{
			Bucket:config.get('bucketName'),//make it secret also additional security
			ContentType:'image/jpeg',
			Key:key
		},(err,url)=>{
			res.send({key,url});
		})
	})
module.exports = router;
