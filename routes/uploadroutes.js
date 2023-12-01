const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const Joi = require('joi');

const uuid = require('uuid');
const auth =require('../middleware/auth');
const config = require('config');

const s3 = new AWS.S3({
	signatureVersion:'v4',
	region: 'ap-south-1'
});
// Create separate validation functions
const validateInput = (schema) => (req, res, next) => {
  const { error } = schema(req.body);
  if (error) {
    dbDebugger(error.details[0].message)
    return res.status(400).send(error.details[0]);
  }
  next();
};

function validateUploadUrlRequest(transaction){
  const schema=Joi.object({
  count:Joi.number().integer().max(4).min(1),
  });
  return schema.validate(transaction);
}

router.get('/multiple', auth, validateInput(validateUploadUrlRequest),async (req, res) => {
	//add validation as notmore than 4
  const numberOfPresignedURLs = req.body.count || 1; // Get the number of URLs from the query parameter (default to 1 if not provided)
  const presignedURLs = [];

  for (let i = 0; i < numberOfPresignedURLs; i++) {
    const key = `${req.user._id}/${uuid.v1()}.jpeg`;

    // Generate a presigned URL and add it to the array
    s3.getSignedUrl('putObject', {
      Bucket: config.get('bucketName'), // Make it secret also additional security
      ContentType: 'image/jpeg',
      Key: key
    }, (err, url) => {
      if (!err) {
        presignedURLs.push({ key, url });

        // Check if we have generated all the required presigned URLs
        if (presignedURLs.length === numberOfPresignedURLs) {
          res.send(presignedURLs);
        }
      } else {
        // Handle the error appropriately
        console.error(err);
        res.status(500).send('Failed to generate presigned URL');
      }
    });
  }
});

module.exports = router;
/*

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
  */
