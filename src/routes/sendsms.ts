const express = require('express');
const router = express.Router();
const { messageSchema, remindMessageSchema, deleteMessageSchema } = require('../utils/validations/smsValidations');
const dbDebugger = require('debug')('app:db');
const sendmessage = require('../middleware/sendmessage');
const auth = require('../middleware/auth');
const config = require('config');

const validateMessage = (req) => {
	const schema = messageSchema;
	return schema.validate(req);
};

const validateRemindMessage = (req) => {
	const schema = remindMessageSchema;
	return schema.validate(req);
};

const validateDeleteMessage = (req) => {
	const schema = deleteMessageSchema;
	return schema.validate(req);
};

router.post('/', auth, async (req, res, next) => {
	const messageType = req.body.messageType;
	req.body.SenderName = req.user.Name;
	req.body.SenderPhoneNumber = req.user.PhoneNumber;
	var result;
	var templateId;
	var link = 'https://bit.ly/settleapp1';
	var message = '';

	if (messageType == 'add') {
		result = validateMessage(req.body);
		templateId = config.get('templateIdAdd');
		//'1607100000000265753';
		config.get('templateIdAdd');
		if (req.body.Isloan) {
			message =
				req.body.SenderName +
				'(' +
				req.body.SenderPhoneNumber +
				') gave you Rs ' +
				req.body.Amount +
				'. \nNow Balance is Rs ' +
				req.body.TotalAmount +
				'. \nSee all txns: ' +
				link +
				' \nSettle App';
		} else {
			message =
				'You gave ' +
				req.body.SenderName +
				'(' +
				req.body.SenderPhoneNumber +
				') Rs ' +
				req.body.Amount +
				'. \nNow Balance is Rs ' +
				req.body.TotalAmount +
				'. \nSee all txns: ' +
				link +
				' \nSettle App';
		}
	} else if (messageType == 'delete') {
		result = validateDeleteMessage(req.body);
		templateId = config.get('templateIdDelete');
		//'1607100000000265754';
		if (req.body.Isloan) {
			message =
				req.body.SenderName +
				'(' +
				req.body.SenderPhoneNumber +
				') gave you Rs ' +
				req.body.Amount +
				'. \nNow Balance is Rs ' +
				req.body.TotalAmount +
				'. \nSee all txns: ' +
				link +
				' \nSettle App';
		} else {
			message =
				'You gave ' +
				req.body.SenderName +
				'(' +
				req.body.SenderPhoneNumber +
				') Rs ' +
				req.body.Amount +
				'. \nNow Balance is Rs ' +
				req.body.TotalAmount +
				'. \nSee all txns: ' +
				link +
				' \nSettle App';
		}
		message = 'Deleted: \n' + message;
	} else if (messageType == 'remind') {
		result = validateRemindMessage(req.body);
		templateId = config.get('templateIdRemind');
		//'1607100000000265755';
		message =
			'Your balance with ' +
			req.body.SenderName +
			'(' +
			req.body.SenderPhoneNumber +
			') is Rs ' +
			req.body.TotalAmount +
			'. \nSee all txns: ' +
			link +
			' \nSettle App';
	}
	if (result.error) {
		dbDebugger(result.error.details[0].message);
		res.status(400).send(result.error.details[0]);
		//res.status(400).send(result.error.details[0].message);
		return;
	}
	const SendSMS = await sendmessage(
		'91' + req.body.ReceiverPhoneNumber,
		message,
		templateId,
	);
	res.send({ SendSMS });
});

module.exports = router;

/*

/*
SendSMS
Input->PhoneNumber(10 digit String)
Output->true(boolean)
Procedure->validateInput using Joi
generate 4 digit random OTP
save entry in Otp Table with Phone ,OTP as field with Otp as encrypted
send SMS to user Phone Number
Return boolean true,if number not 10 digit 400 request send ,if something else fail like database saving then 500 request
*/
/*
router.post('/transactional',auth,async(req,res,next)=>{
	req.body.SenderName = req.user.Name;
	req.body.SenderPhoneNumber = req.user.PhoneNumber;
	const result = validateMessage(req.body);

	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
		//res.status(400).send(result.error.details[0].message);
		return;
	}
	var link ="https://bit.ly/settleapp1";
	var message="";
	if(req.body.Isloan){
		 message = req.body.SenderName+"("+req.body.SenderPhoneNumber+") gave you Rs "+req.body.Amount+". \nNow Balance is Rs "+req.body.TotalAmount+". \nSee all txns: "+link+" \nSettle App";
	}
	else{
		 message = "You gave "+req.body.SenderName+"("+req.body.SenderPhoneNumber+") Rs "+req.body.Amount+". \nNow Balance is Rs "+req.body.TotalAmount+". \nSee all txns: "+link+" \nSettle App";
	}
	const SendSMS = await sendmessage("91"+req.body.ReceiverPhoneNumber,message,'1607100000000265753');
	//console.log(result1);
	res.send({SendSMS})	
	
});
//Delete SMS
/*
//Delete SMS
//hide ids later along wiht priniciple
router.post('/delete',auth,async(req,res,next)=>{
	req.body.SenderName = req.user.Name;
	req.body.SenderPhoneNumber = req.user.PhoneNumber;
	const result = validateDeleteMessage(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
		//res.status(400).send(result.error.details[0].message);
		return;
	}
	var link ="https://bit.ly/settleapp1";
	var message="";
	if(req.body.Isloan){
		 message = req.body.SenderName+"("+req.body.SenderPhoneNumber+") gave you Rs "+req.body.Amount+". "+req.body.TransactionDate.substring(0,10)+". \nBal Rs "+req.body.TotalAmount+". \nDownload: "+link+" Settle App";
	}
	else{
		 message = "You gave "+req.body.SenderName+"("+req.body.SenderPhoneNumber+") Rs "+(-req.body.Amount)+". "+req.body.TransactionDate.substring(0,10)+". \nBal Rs "+req.body.TotalAmount+". \nDownload: "+link+" Settle App";
	}
	var finalmessage = "Deleted: \n"+message;
	const SendSMS = await sendmessage("91"+req.body.ReceiverPhoneNumber,finalmessage,'1607100000000265754');
	//console.log(result1);
	res.send({SendSMS})	
	
});
//Engagement SMS
/*
router.post('/remind',auth,async(req,res,next)=>{
	req.body.SenderName = req.user.Name;
	req.body.SenderPhoneNumber = req.user.PhoneNumber;
	const result = validateRemindMessage(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
		//res.status(400).send(result.error.details[0].message);
		return;
	}
	
	var link ="https://bit.ly/settleapp1";
	var finalmessage = "Your balance with "+req.body.SenderName+"("+req.body.SenderPhoneNumber+") is Rs "+req.body.TotalAmount+". \nSee all txns: "+link+" \nSettle App";
	const SendSMS = await sendmessage("91"+req.body.ReceiverPhoneNumber,finalmessage,'1607100000000265755');
	//console.log(result1);
	res.send({SendSMS})	
	
});
*/
