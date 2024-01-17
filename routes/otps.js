const express = require('express');
//const _ = require('lodash');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');

const router = express.Router();
const {Otp,validatelogin,validateNumber} = require('../models/otp');
const {User} = require('../models/user');

const logger = require('../startup/logging');
const dbDebugger = require('debug')('app:db');

const sendmessage =require('../middleware/sendmessage');

const validateInput = (schema) => (req, res, next) => {
  const { error } = schema(req.body);
  if (error) {
    dbDebugger(error.details[0].message)
    return res.status(400).send(error.details[0]);
  }
  next();
};
//benefit easy to change code for production 
//also sep numbers for further addig new numbers for testing

const testGenApi = () => (req, res, next) => {
  if((req.body.phoneNumber==="5555543210")||(req.body.phoneNumber==="5555566666")||(req.body.phoneNumber==="5555544444")||(req.body.phoneNumber==="5555533333")||(req.body.phoneNumber==="5555522222")||(req.body.phoneNumber==="5555511111")){return res.send({SendSMS:true});}
  next();
};
const testLoginApi = () => async (req, res, next) => {
  if(((req.body.phoneNumber==="5555543210")||(req.body.phoneNumber==="5555566666")||(req.body.phoneNumber==="5555544444")||(req.body.phoneNumber==="5555533333")||(req.body.phoneNumber==="5555522222")||(req.body.phoneNumber==="5555511111"))&& (req.body.otp=="1234")){
  	try{let user = await User.findOne({phoneNumber:req.body.phoneNumber});

		user.fcmToken=req.body.fcmToken;
		const user2 = await user.save();
		logger.info(user2);
		logger.info(req.body);
		const token = user2.generateAuthToken();
		return res.header('x-auth-token',token).send(user2);
  }
  catch(error){
      return res.status(500).send({ error: 'Internal Server Error' });

  }
  }
  next();
};
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
   logger.info(OTP)
    //console.log(OTP)
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
router.post('/generate',testGenApi(),validateInput(validateNumber),async(req,res,next)=>{	
//dummy account direct send true no sms and otp create	
	//const salt = await bcrypt.genSalt(10);
	const smsotp =generateOTP();
	//const OTP = await bcrypt.hash(smsotp,salt)
	const otp = new Otp({phoneNumber:req.body.phoneNumber,otp:smsotp});
	await otp.save();
	//Change SMS Settle APP wording-from provider
	var finalmessage ="OTP for login is: "+smsotp+" Settle App"
	const SendSMS = await sendmessage("91"+req.body.phoneNumber,finalmessage,'1607100000000267487');
	res.send({SendSMS});
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
router.post('/verify',testLoginApi(),validateInput(validatelogin),async(req,res)=>{
	//id is same order as date hence
	const otps = await Otp.find({phoneNumber:req.body.phoneNumber,otp:req.body.otp})  //.sort({_id:-1})
	if(otps.length === 0) return res.status(404).send({message:'Invalid OTP'});
	//const validotp =await bcrypt.compare(req.body.otp,otps[0].otp)
	//if(!validotp) return res.status(404).send({message:'Invalid OTP'});
	else{
	let user = await User.findOne({phoneNumber:req.body.phoneNumber});
	if(user){
		//current not implemented not so getting latest not much security needed otherwise keep date field and check using 
		//created At and moment library
		user.fcmToken=req.body.fcmToken;
		const user2 = await user.save();
		const token = user2.generateAuthToken();
		res.header('x-auth-token',token).send(user2);
	}
	else{
	user = new User(req.body);
	const newuser = await user.save();
	const token = newuser.generateAuthToken()
	res.header('x-auth-token',token).send(user);
	}
	}
});
module.exports =router;