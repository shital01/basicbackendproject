const express = require('express');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const {Otp,validatelogin,validateNumber} = require('../models/otp');
const {User} = require('../models/user');

const logger = require('../startup/logging');
const dbDebugger = require('debug')('app:db');

const sendmessage =require('../middleware/sendmessage');
/*helper function to generate OTP for generateOTP api
Input->{}
OutPut->4 digit otp string
*/
function generateOTP() {       
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
   // console.log(OTP)
    //logger.info(OTP)
    //dbDebugger(OTP)
    return OTP;
}
//return in eahc res.send but will stop other middelware so use if else blokcs system
/*
GenerateOTP
Input->PhoneNumber(10 digit String)
Output->true(boolean)
Procedure->validateInput using Joi
generate 4 digit random OTP
save entry in Otp Table with Phone ,OTP as field with Otp as encrypted
send SMS to user Phone Number
Return boolean true,if number not 10 digit 400 request send ,if something else fail like database saving then 500 request
*/
router.post('/generate',async(req,res,next)=>{
	const result = validateNumber(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message);
		res.status(400).send(result.error.details[0]);
		//error.object
		//Alternate error.message
	}
	else{
//dummy account direct send true no sms and otp create
		if(req.body.phoneNumber==="5555543210"){
		//	user = new User(req.body);
	//const newuser = await user.save();
			res.send({SendSMS:true});
		}
		else{
	const salt = await bcrypt.genSalt(10);
	const smsotp =generateOTP();
	const OTP = await bcrypt.hash(smsotp,salt)
	const otp = new Otp({phoneNumber:req.body.phoneNumber,otp:OTP});
	await otp.save();
	//Change SMS Settle APP wording-from provider
	var finalmessage ="OTP for login is: "+smsotp+" Settle App"
	const SendSMS = await sendmessage("91"+req.body.phoneNumber,finalmessage,'1607100000000267487');
	res.send({SendSMS});
	}
	}
});
/*
	Input->PhoneNumber(10 digit String),OTP(4 digit String)
	Output->User Object with Field as _id,PhoneNumber ,Name (optional if user is login not new)
	and header x-auth-token as token which has to be send with sensitive api request from client side which contain user info 
	Procedure->
	Validate Input
	Check if user Exists or Not(to decide login or signup)
	Check if OTP match or Not
	Save user if new user
	Generate authentication token
	Return ->
	If successful then user object along with x-auth-header
	If validation fail then code 400 and error message
	If OTP failed either not requested or OTP mismatch send response with 404 code and error message
	If something else fail like database saving then Response send with code 500 and error message
*/
router.post('/verify',async(req,res)=>{
	const result = validatelogin(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);//details or message
	}
	else{

		if(req.body.phoneNumber==="5555543210" && req.body.otp=="1234"){
			let user = await User.findOne({phoneNumber:req.body.phoneNumber});
			const token = user.generateAuthToken();
			res.header('x-auth-token',token).send(user);
		}
		else{
	//id is same order as date hence
	const otps = await Otp.find({phoneNumber:req.body.phoneNumber}).sort({_id:-1})
	if(otps.length === 0) return res.status(404).send({error:{message:'Invalid OTP'}});
	const validotp =await bcrypt.compare(req.body.otp,otps[0].otp)
	if(!validotp) return res.status(404).send({error:{message:'Invalid OTP'}});
	
	let user = await User.findOne({phoneNumber:req.body.phoneNumber});
	if(user){
		//current not implemented not so getting latest not much security needed otherwise keep date field and check using 
		//created At and moment library
		const token = user.generateAuthToken();
		res.header('x-auth-token',token).send(user);
	}
	else{
	user = new User(req.body);
	const newuser = await user.save();
	const token = newuser.generateAuthToken()
	res.header('x-auth-token',token).send(user);
	}
	}
}

});
module.exports =router;
