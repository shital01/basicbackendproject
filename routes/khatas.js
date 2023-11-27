const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Khata,validate,validate2,validateUpdateKhata,validateKhataArray} = require('../models/khata');
const {User} = require('../models/user');
const auth =require('../middleware/auth');

/*
Input->Auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
router.get('/',auth,async(req,res)=>{
	const PhoneNumber = req.user.phoneNumber;
    var khatas;
	//watch performance of this ,use limit feature and sort for extra large queries
  var lastUpdatedTimeStamp;
  if(req.body.lastUpdatedTimeStamp){
   lastUpdatedTimeStamp = req.body.lastUpdatedTimeStamp;
  khatas = await Khata
  .find({$and:[{$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]},{updatedTimeStamp:{$gt:lastUpdatedTimeStamp}}]})
  //.sort({Date:1})

 }
else{
	 khatas = await Khata
	.find({$or:[{userPhoneNumber:{$eq: PhoneNumber}},{friendPhoneNumber:{$eq: PhoneNumber}}]})
	//.sort({Date:1})
	//dbDebugger(transactions);
}
	res.send(khatas);	
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
router.post('/single',auth,async(req,res)=>{
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
		const khata = new Khata(req.body);
		const output = await khata.save();
		res.send(output);
		}
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
router.delete('/deleteAll', auth, async (req, res) => {
        // Assuming userId is passed as a parameter in the URL
        const userId = req.user._id;

        // Delete all khatas associated with the given userId
        const deletionResult = await Khata.deleteMany({ userId: userId });

        res.send(deletionResult); // Sending deletion result as response
        // Handle any errors that might occur during deletion
      
});
//arrays try 
/*
const savedEntries = [];
    const unsavedEntries = [];

    khataEntries.forEach((entry, index) => {
      if (result.mongoose.validationErrors[index]) {
        unsavedEntries.push({ ...entry, error: result.mongoose.validationErrors[index].message });
      } else {
        savedEntries.push(entry);
      }
    });
    */

router.post('/multiple2', auth, async (req, res) => {
  const userId = req.user._id;
  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name;
  const khataEntries = req.body;

  const savedEntries = [];
  const unsavedEntries = [];

  for (const entry of khataEntries) {
    // Validate each entry using your validation function (validateKhata)
    
      // If validation passes, create a new Khata and save it
      const khata = new Khata({
        ...entry,
        userId,
        userPhoneNumber,
        userName,
      });

         try {
        const savedEntry = await khata.save();
        savedEntries.push(savedEntry);
      } catch (err) {
        // Handle any save errors here
        unsavedEntries.push({
          ...entry,
          error: err.message,
        });
      }
    
    }

  res.send({ savedEntries, unsavedEntries });
});


router.post('/multiple', auth, async (req, res) => {
  const userId = req.user._id;
  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name;
  const khataEntries = req.body;

  const savedEntries = [];
  const unsavedEntries = [];

  for (const entry of khataEntries) {
    // Validate each entry using your validation function (validateKhata)
    const { error } = validate2(entry);
    if (error) {
      unsavedEntries.push({
        ...entry,
        error: error.details[0].message,
      });
    } else {
      // If validation passes, create a new Khata and save it
      const khata = new Khata({
        ...entry,
        userId,
        userPhoneNumber,
        userName,
      });

         try {
        const savedEntry = await khata.save();
        savedEntries.push(savedEntry);
      } catch (err) {
        // Handle any save errors here
        unsavedEntries.push({
          ...entry,
          error: err.message,
        });
      }
    }
  }

  res.send({ savedEntries, unsavedEntries });
});


router.post('/multiple3',auth,async(req,res)=>{
  //const result = validateKhataArray(req.body);
    //get id and Number form user object so to imply safety (allowed Api and same time consistency of id as not from client)
  const userId = req.user._id;
  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name; 
  /* 
  if(result.error){
    dbDebugger(result.error.details[0].message)
    res.status(400).send(result.error.details[0]);
  }
  else{//IST time
    */
    const khataEntries = req.body.map((entry) => {
      return new Khata({
        ...entry,
        userId,
        userPhoneNumber,
        userName,
      });
    });
      const result = await Khata.insertMany(khataEntries,{ ordered: false,rawResult:true } );
      console.log(result);
      console.log(result.insertedIds[0]);
            console.log(result.insertedIds[1]);

      console.log(result.insertedIds[2]);
            console.log(result.insertedIds[3]);
console.log(result.mongoose.validationErrors[0])
console.log(result.mongoose.validationErrors[0].errors)

  //console.log(result.mongoose.validationErrors[0].errors.friendName.properties.message)
  console.log(result.mongoose.validationErrors[0]._message)
    console.log(result.mongoose.validationErrors[1]._message)

    const savedEntries = khataEntries.filter((entry,index) => !result.insertedIds[index]);
    const unsavedEntries = khataEntries.filter((entry,index) => !!result.insertedIds[index]);

    res.send({ savedEntries, unsavedEntries });
      //res.send(output);
    //}
});
//to edit khata

router.put('/',auth,async(req,res)=>{
	const result = validateUpdateKhata(req.body);
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send({error:result.error.details[0],response:null});
	}
	else{
	//Query first findbyId()...modify and save()--if any coniditoin before update
	//update first optional to get updated document....if not need then this 
	const khata = await Khata.findById(req.body.khataId);
	if(!khata) { res.status(400).send({error:{message:'Khata doesnot exits with given Id'},response:null});}
	else if(!khata.userId.equals(req.user._id)) { res.status(403).send({error:{message:'Not Access for updating seen status'},response:null});}
	else{req.body.updatedTimeStamp=Math.floor(Date.now());
	khata.set(req.body)
	const mresult = await khata.save();
	res.send(mresult);
	}
	}
});
module.exports =router;