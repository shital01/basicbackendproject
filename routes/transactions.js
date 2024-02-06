const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Transaction,validate,validate2,validateUpdateTransaction,validateUpdateSeenStatus,validateRequestTransaction} = require('../models/transaction');
const {User} = require('../models/user');
const {Khata} = require('../models/khata');

const auth =require('../middleware/auth');
const logger = require('../startup/logging');

//Notification firing test
const sendnotification =require('../middleware/notification');
const sendmessage =require('../middleware/sendmessage');
const config = require('config');

//testnotifiation
/*

router.post('/testnotify',auth,async(req,res)=>{
	//add limit on size of array to handle unexpected long requests-also decided by server as not size but query return time also a factor
	const users = await User.find({phoneNumber: req.body.phoneNumber}).select("fcmToken")
	if(users.length===0) { res.status(404).send({message:'No User exits'})}
	else{
		//users[0].fcmToken="fy5RSfmcQwy5_6WPK7jb-m:APA91bFBgO_AGPr7EDfi8VYdc6YLeQzf7Vg0J34p3c3WDM0-UaFx48JJ--j18ttJCyRePLwxO19XSAPbDHXegrmYqcyDv70EGicYo495ZMbdEMZ2PWvxeF35DdNm7Iq-31TF3U75n4n6"

		if(users[0].fcmToken){
		const result=await sendnotification(users[0].fcmToken,"title","body",req.body.phoneNumber);
				res.send(true);
	}
		else{res.send(false);}
	}
})

*/
	

// Create separate validation functions
const validateInput = (schema, query = false) => (req, res, next) => {
  const { error } = query ? schema(req.query) : schema(req.body);
  if (error) {
    dbDebugger(error.details[0].message);
    return res.status(400).send(error.details[0]);
  }
  next();
};

/*
Input->Auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
//,
router.get('/',auth,validateInput(validateRequestTransaction,true),async(req,res)=>{

			const deviceId = req.header('deviceId');;
  	var timeStamp=Date.now();
	//adding default pagesize and pagenumber as of now in btoh get api for safety
	var pageSize=500;
	var pageNumber=1;
	var nextPageNumber;
	var lastUpdatedTimeStamp;
	var transactions;
	if(req.query.pageNumber){pageNumber=req.query.pageNumber;}
	if(req.query.pageSize){pageSize=req.query.pageSize;}
	if(req.query.lastUpdatedTimeStamp){ lastUpdatedTimeStamp = req.query.lastUpdatedTimeStamp;}
	const PhoneNumber = req.user.phoneNumber;
	
	const khatas = await Khata
		.find({$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]})
		.select("_id")
	//watch performance of this ,use limit feature and sort for extra large queries
	if(req.query.lastUpdatedTimeStamp){
		 transactions = await Transaction
		.find({$and:[{khataId: { $in: khatas}},{updatedTimeStamp:{$gt:lastUpdatedTimeStamp}}]})
		.sort('updatedTimeStamp')
		.skip(pageSize*(pageNumber-1))
		.limit(pageSize);//watch performance of this
	}
	else{
	 transactions = await Transaction
	.find({khataId: { $in: khatas}})
	.sort({ updatedTimeStamp: 1 })
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize);
		}
	//.sort({Date:1})
	//dbDebugger(transactions);
	//console.log(transactions)
	if(transactions.length>0){
		timeStamp=transactions[transactions.length-1].updatedTimeStamp;
	}

var categorizedEntries;
	// Filter by deviceId
		if(req.query.lastUpdatedTimeStamp){
	 categorizedEntries = transactions.reduce(
  (result, entry) => {
    if (entry.deviceId !== deviceId) {
      if (entry.deleteFlag === true) {
        result.deletedEntries.push(entry);
      } else {
        result.newEntries.push(entry);
      }
    }
    return result;
  },
  { deletedEntries: [], newEntries: [] }
);

}
else{
 categorizedEntries = transactions.reduce(
  (result, entry) => {
      if (entry.deleteFlag === true) {
        result.deletedEntries.push(entry);
      } else {
        result.newEntries.push(entry);
      }
    return result;
  },
  { deletedEntries: [], newEntries: [] }
);
}

const { deletedEntries, newEntries } = categorizedEntries;


	if(transactions.length == pageSize){	
			nextPageNumber=parseInt(pageNumber)+1;
			res.send({nextPageNumber:nextPageNumber,deletedEntries,newEntries,timeStamp})
			}
		else{			res.send({deletedEntries,newEntries,timeStamp})
}
	//res.send(transactions);
});
//muliptle psot
  

 
//must limit size of this qeury frontend and backedn
//test for mulitple and khata scripts
router.post('/multiple', auth, async (req, res) => {
	const userId = req.user._id;
	const deviceId = req.header('deviceId');;

  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name;
 const transactionEntries = req.body;

  const savedEntries = [];
  const unsavedEntries = [];
console.log(req.body);
 for (const entry of transactionEntries) {
    // Validate each entry using your validation function (validateKhata)
    const { error } = validate2(entry);
    if (error) {
      unsavedEntries.push({
        ...entry,
        error: error.details[0].message,
      });
    } else {
    	const { sendSms, ...newEntry } = entry;

      // If validation passes, create a new Khata and save it
      const transaction = new Transaction({
        ...newEntry,
        deviceId,
        userId,
        userPhoneNumber,
        userName,
      });

         try {
        const savedEntry = await transaction.save();
        savedEntries.push(savedEntry);
		//send notification
		const khata = await Khata.findById(transaction.khataId).select("userPhoneNumber friendPhoneNumber friendName")
		console.log(khata);
		var searchPhoneNumber=khata.friendPhoneNumber;
		if(userPhoneNumber===searchPhoneNumber){searchPhoneNumber=khata.userPhoneNumber}
		const user = await User.findOne({phoneNumber: searchPhoneNumber}).select("fcmToken")
		//console.log(transaction);
		//console.log(user.fcmToken)
		var smsMessage;
			var link ="https://bit.ly/settleapp1";
			if(transaction.amountGiveBool){
				smsMessage= userName+"("+userPhoneNumber+") gave you Rs "+transaction.amount+". \nNow Balance is Rs "+transaction.amount+". \nSee all txns: "+link+" \nSettle App";
			}
			else{
				smsMessage = "You gave "+userName+"("+userPhoneNumber+") Rs "+transaction.amount+". \nNow Balance is Rs "+trannsaction.amount+". \nSee all txns: "+link+" \nSettle App";
			}
		if(user && user.fcmToken) { 
			console.log("success notifcation")
			var message;
			

			if(transaction.amountGiveBool){
				message="CREDIT: I gave you Rs "+transaction.amount+".";
				smsMessage= userName+"("+userPhoneNumber+") gave you Rs "+transaction.amount+". \nNow Balance is Rs "+transaction.amount+". \nSee all txns: "+link+" \nSettle App";

				console.log(user.fcmToken,userName,message)
				const result = sendnotification(user.fcmToken,userName,message,userPhoneNumber);
			}
			else{
				message="DEBIT: You gave me Rs "+transaction.amount+".";
				console.log(user.fcmToken,userName,message)
				smsMessage = "You gave "+userName+"("+userPhoneNumber+") Rs "+transaction.amount+". \nNow Balance is Rs "+trannsaction.amount+". \nSee all txns: "+link+" \nSettle App";
				const res = sendnotification(user.fcmToken,userName,message,userPhoneNumber);

			}
			
			//const result=sendnotification(user.fcmToken,"title","body","1");
		}
		if(sendSms==true){
				const templateId = 1607100000000265753;
				//config.get('templateIdAdd');
				const SendSMS = await sendmessage("91"+searchPhoneNumber,smsMessage,templateId);
				console.log(SendSMS)
			}
		//end of notification	




      } catch (err) {
        // Handle any save errors here
        unsavedEntries.push({
          ...entry,
          error: err.message,
        });
      }
    
    }
}
//Modify Entry







/*
  // Modify savedEntries before sending the response
  const modifiedEntries = savedEntries.map(entry => {
    // Check if the userId matches req.user._id
    if (entry.userId.toString() !== userId.toString()) {
      // Flip the amountGiveBool if userId doesn't match
      return {
        ...entry,
        amountGiveBool: !entry.amountGiveBool,
      };
    }
    return entry;
  });
*/
console.log({ savedEntries, unsavedEntries })

  res.send({ savedEntries, unsavedEntries });
});

/*
Input->TransactionId(ObjectID)
Output->empty
Procedure->validate Inputs(otherwise 400 with message)
check if Transaction exits(400 with message)
check is user allwoed (403 with message)
update and return
*/
//check before save khata id proper validation
//check here seen feature allowe dor not currenlty skip
/*
router.put('/',auth,validateInput(validateUpdateTransaction),async(req,res)=>{
		const deviceId = req.header('deviceId');;

	//Query first findbyId()...modify and save()--if any coniditoin before update
	//update first optional to get updated document....if not need then this 
	const transaction = await Transaction.findById(req.body.transactionId);
	if(!transaction) { res.status(400).send({error:{message:'Transaction doesnot exits with given Id'},response:null});}
	//else if(!transaction.friendPhoneNumber.equals(req.user.phoneNumber)) { res.status(403).send({error:{message:'Not Access for updating seen status'},response:null});}
	//deleteFlag and seen both seperate feature-seperate authentication
	else{req.body.updatedTimeStamp=Date.now();
		req.body.deviceId=deviceId;
		req.body.updatedFlag=true;
	//findbyid and update return new or old nto normal update
	//whatever it is change seenStatus or deleteFlag
	transaction.set(req.body)
	const mresult = await transaction.save();
	res.send(mresult);
	}
});
*/
//
router.put('/updateSeenStatus', auth, validateInput(validateUpdateSeenStatus), async (req, res) => {
		const deviceId = req.header('deviceId');;

    const { transactionIds } = req.body;
    // Update seenStatus to true for the provided transactionIds
    const updateResult = await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { $set: { seenStatus: true } }//, updatedTimeStamp: Date.now()
    );
    // Check if any transactions were updated
    console.log(updateResult)
    if (updateResult.modifiedCount > 0) {
      res.send({ message: 'Seen status updated successfully for specified transactions' });
    } else {
      res.status(404).send({ errormessage: 'No transactions found for the provided IDs' });
    }
  
});


router.put('/delete', auth, validateInput(validateUpdateSeenStatus), async (req, res) => {
		const deviceId = req.header('deviceId');;
		const userName =req.user.name;
		const myPhoneNumber = req.user.phoneNumber;
    const { transactionIds } = req.body;
    // Update seenStatus to true for the provided transactionIds
    const updateResult = await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { $set: { deleteFlag: true  , updatedTimeStamp: Date.now(),deviceId}}
	)
    // Check if any transactions were updated
    //console.log(updateResult)
    if (updateResult.modifiedCount > 0) {

     // Fetch friend's phone number and send notification
      const transactions = await Transaction.find({ _id: { $in: transactionIds } });
      const khataIds = transactions.map(transaction => transaction.khataId);

      const khataDetails = await Khata.find({ _id: { $in: khataIds } });

      for (const transaction of transactions) {
        const khata = khataDetails.find(khata => khata._id.equals(transaction.khataId));
        if (!khata) {
          continue;
        }
        var searchPhoneNumber = khata.friendPhoneNumber;
        if(myPhoneNumber === searchPhoneNumber){searchPhoneNumber=khata.userPhoneNumber}
        // Fetch additional details like amount, transactionDate, and userName
        const { amountGiveBool,amount, transactionDate } = transaction;

        // Find fcmToken using the friend's phone number
        const user = await User.findOne({ phoneNumber: searchPhoneNumber });

        if (user && user.fcmToken) {
          // Assuming sendNotificationByToken takes additional parameters for amount, transactionDate, userName
          var message = "DELETED: ";
          if(amountGiveBool){
          	message=message+"I gave you Rs "+amount+" on "+new Date(transactionDate).toLocaleDateString();
          }
          else{
          	message=message+"You gave me Rs "+amount+" on "+new Date(transactionDate).toLocaleDateString();

          }
          await sendnotification(
            user.fcmToken,
            userName,
           	message,
           	myPhoneNumber
          );




        }
    }
      res.send({ message: 'delete status updated successfully for specified transactions' });
    } else {
      res.status(404).send({ errormessage: 'No transactions found for the provided IDs' });
    }
})
module.exports =router;



/*
Input->lastUpdatedDate(Date format and date of latest entry) along with auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
//for safety in btph api pagination used
//size check by repsonse seize safety and 
//for user profiel fetch is query time is bottle neck maybe
//limit prequery instead sort and skip thign to save time and avoid query fail logn request as 10 
//all get api secured as not too long time or repsonse 
/*

router.put('/fetchtransactions',auth,async(req,res)=>{
	//throw new Error("hello")
	//limit for large query wiht sort feature
	//check for date format-save update and fetch vs user object id
	var pageSize=500;
	var pageNumber=1;
	var nextPageNumber;
	if(req.body.pageNumber){pageNumber=req.body.pageNumber;}
	if(req.body.pageSize){pageSize=req.body.pageSize;}

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
		.find({$and:[{$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]},{updatedTimeStamp:{$gt:lastUpdatedTimeStamp}}]})
		.sort('updatedTimeStamp')
		.skip(pageSize*(pageNumber-1))
		.limit(pageSize);//watch performance of this
		//.sort({Date:1})
		//dbDebugger(transactions);
		if(transactions.length == pageSize){	
			nextPageNumber=pageNumber+1;
			res.send({nextPageNumber:nextPageNumber,results:transactions})
			}
		else{res.send({results:transactions});}
	}	
});
*/

/*
Input->Transaction id as parameter
send x-auth-token
Output->Transaction id of deleted object
Procedure->validate header
validate input
delete transaction check is it allowed?
return deleted object id  or validation error or if already deleted then 400 or if nto allowed then 403 
*/
/*
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
	result1.updatedTimeStamp=Math.floor(Date.now());
	//findbyid and update return new or old nto normal update
	const mresult = await result1.save();
	res.send(mresult);
	}}});
*/
/*
Input->RecieverName(String),Isloan(String),RecieverPhoneNumber(10 digit String),Amount(Integer),AttachmentsPath(array of strings) whcih comes form key
send x-auth-token
Output->transaction Object
Procedure->validate header
validate input
save transaction
return saved object
*/


/*
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
*/