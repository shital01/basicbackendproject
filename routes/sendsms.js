const express = require('express');
const router = express.Router();
const sendmessage =require('../middleware/sendmessage');

router.post('/',async(req,res,next)=>{
	var finalmessage ="OTP for login is: "+1234+" Settle App"
	const SendSMS = await sendmessage("91"+8879426649,finalmessage,'1607100000000267487');
	res.send({SendSMS});
});

module.exports =router;
