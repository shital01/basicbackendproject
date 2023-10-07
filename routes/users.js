const express = require('express');
//instead of app word router is used
const router = express.Router();
const Joi = require('joi');
const config = require('config');
const {User} = require('../models/user');
const auth =require('../middleware/auth');
const dbDebugger = require('debug')('app:db');

/*
Input->
Name-String
Output->
Procedure->
Validate Header
Validate Input
Find user by id
Update user Name
Return ->
If Successful then Return UserObject
If token invalid then 400 and 401 if not provided
If validation fail then code 400 and error message
If user does not exist then 400 with error message
If something else fail like database saving then Response send with code 500 and error message
*/
router.put('/updateprofile',auth,async(req,res)=>{
	const result = validateUpdateUser(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
	}
	else{
	let user = await User.findById(req.user._id);//for token regeneration hence not one lien do
	if(!user){res.status(400).send({error:{message:'No User exits'}})}
		else{
	if(req.body.name){user.name=req.body.name;}
	if(req.body.profilePictureUrl){user.profilePictureUrl =req.body.profilePictureUrl;}
	const user2 = await user.save();
	const token = user2.generateAuthToken()
	res.header('x-auth-token',token).send(user2);
	}
}
});

//friendsprofile pic
router.post('/friendsprofile',auth,async(req,res)=>{
	//add limit on size of array to handle unexpected long requests-also decided by server as not size but query return time also a factor
	const result = validateNumbers(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
	}
	else{
	const users = await User.find({phoneNumber: { $in: req.body.phoneNumbers}}).select("phoneNumber profilePictureUrl name")
	if(users.length===0) { res.status(404).send({error:{message:'No User exits'}})}
	else{res.send(users);}
	}
})


function validateUpdateUser(user){
	const schema=Joi.object({
	name:Joi.string().allow(null, '').max(64),
	profilePictureUrl:Joi.string().allow(null, '')
	});
	return schema.validate(user);
}
function validateNumbers(req){
	const schema=Joi.object({
	phoneNumbers:Joi.array().items(Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required())
	});
	return schema.validate(req);
}

module.exports =router;