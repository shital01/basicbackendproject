const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Transaction,validate,validateDeleteTransaction,validateUpdateTransaction,validateRequestTransaction} = require('../models/transaction');
const {User} = require('../models/user');
const auth =require('../middleware/auth');
/*
Input->lastUpdatedDate(Date format and date of latest entry) along with auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
router.put('/fetchtransactions',auth,async(req,res)=>{
	//throw new Error("hello")
	//limit for large query wiht sort feature
	//check for date format-save update and fetch vs user object id
	const lastUpdatedTimeStamp = req.body.lastUpdatedTimeStamp;
	const result = validateRequestTransaction(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
 	}
 	else{
			//watch performance of this
	 	const PhoneNumber = req.user.phoneNumber;
		const transactions = await Transaction
		.find({$and:[{$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]},{updatedTimeStamp:{$gt:lastUpdatedTimeStamp}}]})//watch performance of this
		//.sort({Date:1})
		//dbDebugger(transactions);
		res.send(transactions);
	}	
});
/*
Input->Auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
router.get('/',auth,async(req,res)=>{
	const PhoneNumber = req.user.phoneNumber;
	//watch performance of this ,use limit feature and sort for extra large queries
	const transactions = await Transaction
	.find({$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]})
	//.sort({Date:1})
	//dbDebugger(transactions);
	res.send(transactions);	
});

/*
Input->RecieverName(String),Isloan(String),RecieverPhoneNumber(10 digit String),Amount(Integer),AttachmentsPath(array of strings) whcih comes form key
send x-auth-token
Output->transaction Object
Procedure->validate header
validate input
save transaction
return saved object
*/
router.post('/',auth,async(req,res)=>{
	const result = validate(req.body);
		//get id and Number form user object so to imply safety (allowed Api and same time consistency of id as not from client)
	req.body.userId=req.user._id;
	req.body.userPhoneNumber = req.user.phoneNumber;
	req.body.userName=req.user.name;
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
	}
	else{//IST time
		//req.body.updatedTimeStamp=Date.now();
		const transaction = new Transaction(req.body);
		const output = await transaction.save();
		res.send(output);
		}
});
/*
Input->Transaction id as parameter
send x-auth-token
Output->Transaction id of deleted object
Procedure->validate header
validate input
delete transaction check is it allowed?
return deleted object id  or validation error or if already deleted then 400 or if nto allowed then 403 
*/
router.delete('/delete',auth,async(req,res)=>{
	const result = validateDeleteTransaction({"transactionId":req.body.id})
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);		
	}
	else{
	const result1 =await Transaction.findById(req.body.id);
	if(!result1) { res.status(400).send({message:'No Such Transaction exits wrong id provided'});}
	else if(!result1.userId.equals(req.user._id)) { res.status(403).send({message:'Not Access for deleting'});}
	else{
	result1.deleteFlag=true;
	result1.updatedTimeStamp=Date.now();
	//findbyid and update return new or old nto normal update
	const mresult = await result1.save();
	res.send(mresult);
	}}});
module.exports =router;