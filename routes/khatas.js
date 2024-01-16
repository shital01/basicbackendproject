const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Khata,validate,validateGetKhata,validateUpdateKhata,validateKhata,validateUpdateSettle} = require('../models/khata');
const {User} = require('../models/user');
const auth =require('../middleware/auth');
//Validation Start
const logger = require('../startup/logging');

const sendNotification =require('../middleware/notification');

//Seperate the middel ware of validation
//validateGetKhata
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
//,validateInput(validateGetKhata)
//PageSize and Page Number to be included in get function
router.get('/',auth,validateInput(validateGetKhata,true),async(req,res)=>{
      const deviceId = req.header('deviceId');;

	const PhoneNumber = req.user.phoneNumber;
    var khatas;
	//watch performance of this ,use limit feature and sort for extra large queries
  var lastUpdatedTimeStamp;
  var timeStamp=Date.now();
  if(req.query.lastUpdatedTimeStamp){
   lastUpdatedTimeStamp = req.query.lastUpdatedTimeStamp;
   console.log(lastUpdatedTimeStamp)
  khatas = await Khata
  .find({$and:[{$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]},{updatedTimeStamp:{$gt:lastUpdatedTimeStamp}}]})
  .sort({updatedTimeStamp:1})

 }
else{
	 khatas = await Khata
	.find({$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]})
	.sort({updatedTimeStamp:1})
	//dbDebugger(transactions);
}
if(khatas.length>0){
    timeStamp=khatas[khatas.length-1].updatedTimeStamp;
  }

var categorizedEntries;
    if(req.query.lastUpdatedTimeStamp){
 categorizedEntries = khatas.reduce(
  (result, entry) => {
    if (entry.deviceId !== deviceId) {
/*
      if (entry.settledFlag === true) {
        result.settledEntries.push(entry);
      } else if (entry.updatedFlag === true) {
        result.updatedEntries.push(entry);
      } else {
        result.newEntries.push(entry);
      }
*/
      result.newEntries.push(entry);
    }
    return result;
  },
  { settledEntries: [], updatedEntries: [], newEntries: [] }
);
}
else{
 categorizedEntries = khatas.reduce(
  (result, entry) => {
/*
      if (entry.settledFlag === true) {
        result.settledEntries.push(entry);
      } else if (entry.updatedFlag === true) {
        result.updatedEntries.push(entry);
      } else {
        result.newEntries.push(entry);
      }
      */
      result.newEntries.push(entry);

    return result;
  },
  { settledEntries: [], updatedEntries: [], newEntries: [] }
);
}

const { settledEntries, updatedEntries, newEntries } = categorizedEntries;







	res.send({ settledEntries, updatedEntries, newEntries ,timeStamp});	
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

router.post('/multiple', auth, async (req, res) => {
    const deviceId = req.header('deviceId');
console.log(deviceId)
  const userId = req.user._id;
  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name;
  const khataEntries = req.body;
  logger.info(khataEntries)
  const savedEntries = [];
  const unsavedEntries = [];

  for (const entry of khataEntries) {
    // Validate each entry using your validation function (validateKhata)
    const { error } = validate(entry);
    if (error) {
      unsavedEntries.push({
        ...entry,
        error: error.details[0].message,
      });
    } else {
      // If validation passes, create a new Khata and save it
      const khata = new Khata({
        ...entry,
        deviceId,
        userId,
        userPhoneNumber,
        userName,
      });

         try {
        const savedEntry = await khata.save();
        savedEntries.push(savedEntry);

// Send notification to friendPhoneNumber for savedEntry
        const user = await User.findOne({ phoneNumber: savedEntry.friendPhoneNumber });

        if (user && user.fcmToken) {
          console.log("came here")
          // Assuming sendNotification takes fcmToken as a parameter
          await sendNotification(user.fcmToken, savedEntry.userName,"Added you to their ByajKhata",savedEntry.friendPhoneNumber);
        }



      } catch (err) {
        // Handle any save errors here
        unsavedEntries.push({
          ...entry,
          error: err.message,
        });
      }
    }
  }
console.log({ savedEntries, unsavedEntries });
  res.send({ savedEntries, unsavedEntries });
});

//,validateInput(validateKhataArray)
//first validation
//then insert many 
//save as much as you can rest in error
//overall return structure-failed 1,pass,failed2

//notice performance of mulitple 1 and mulitpel 2 in parts to see whci one need to be optimized


//first without validaiotn return success vs unsuccess but no reason 


function validateKhataArray(khataEntries) {
  const validEntries = [];
  const invalidEntries = [];

  khataEntries.forEach((entry) => {
    const { value, error } = validate(entry); // Assuming validateKhata is the validation function for individual khata objects

    if (error) {
      invalidEntries.push({ ...entry, errormessage: error.details[0].message });
    } else {
      validEntries.push(value);
    }
  });

  return { validEntries, invalidEntries };
}



//to edit khata
//DELETE KHATA OPTION


router.put('/',auth,validateInput(validateUpdateKhata),async(req,res)=>{
    const deviceId = req.header('deviceId');;

	//Query first findbyId()...modify and save()--if any coniditoin before update
	//update first optional to get updated document....if not need then this 
	const khata = await Khata.findById(req.body.khataId);
	if(!khata) { res.status(400).send({error:{message:'Khata doesnot exits with given Id'},response:null});}
	else if(!khata.userId.equals(req.user._id)) { res.status(403).send({error:{message:'Not Access for updating seen status'},response:null});}
	else{req.body.updatedTimeStamp=Date.now();
    req.body.deviceId=deviceId;
	khata.set(req.body)
	const mresult = await khata.save();
	res.send(mresult);
	}
});

router.put('/unsettle', auth, validateInput(validateUpdateSettle), async (req, res) => {
    const deviceId = req.header('deviceId');;
    const userName =req.user.name;
    const { khataIds } = req.body;
    // Update seenStatus to true for the provided transactionIds
    const updateResult = await Khata.updateMany(
      { _id: { $in: khataIds } },
      { $set: { settledFlag: false  , updatedTimeStamp: Date.now(),deviceId}}
  )
    // Check if any transactions were updated
    //console.log(updateResult)
    if (updateResult.modifiedCount > 0) {
      res.send({ message: 'settled status updated successfully for specified transactions' });
    } else {
      res.status(404).send({ errormessage: 'No khata found for the provided IDs' });
    }
})

router.put('/settle', auth, validateInput(validateUpdateSettle), async (req, res) => {
    const deviceId = req.header('deviceId');;
    const userName =req.user.name;
    const phoneNumber = req.user.phoneNumber;
    const { khataIds } = req.body;
    // Update seenStatus to true for the provided transactionIds
    const updateResult = await Khata.updateMany(
      { _id: { $in: khataIds } },
      { $set: { settledFlag: true  , updatedTimeStamp: Date.now(),deviceId}}
  )
    // Check if any transactions were updated
    //console.log(updateResult)
    if (updateResult.modifiedCount > 0) {

      const khataDetails = await Khata.find({ _id: { $in: khataIds } });

      for (const khata of khataDetails) {
        const {  userPhoneNumber,friendPhoneNumber } = khata;
        //
        var searchPhoneNumber = friendPhoneNumber;
        if(phoneNumber === friendPhoneNumber){searchPhoneNumber=userPhoneNumber}
        // Find fcmToken using the friend's phone number
        const user = await User.findOne({ phoneNumber: searchPhoneNumber });

        if (user && user.fcmToken) {
          // Assuming sendNotification takes userName and fcmToken as parameters
          await sendNotification(user.fcmToken, userName,"Account Settled. Updated Balance is Zero",searchPhoneNumber);
        }
      }

      res.send({ message: 'settled status updated successfully for specified transactions' });
    } else {
      res.status(404).send({ errormessage: 'No khata found for the provided IDs' });
    }
})



      
     


module.exports =router;
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
router.post('/single',auth,validateInput(validate),async(req,res)=>{
    //get id and Number form user object so to imply safety (allowed Api and same time consistency of id as not from client)
  req.body.userId=req.user._id;
  req.body.userPhoneNumber = req.user.phoneNumber;
  req.body.userName=req.user.name;
     //IST time
    //req.body.updatedTimeStamp=Date.now();
    const khata = new Khata(req.body);
    const output = await khata.save();
    res.send(output);
  });
  */