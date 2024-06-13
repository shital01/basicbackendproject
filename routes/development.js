//Only development Apis
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const { Khata } = require('../models/khata');
const { Transaction } = require('../models/transaction');
const { User } = require('../models/user');
const auth = require('../middleware/auth');

//Development Only
router.delete('/deleteAllKhatas', auth, async (req, res) => {
	// Assuming userId is passed as a parameter in the URL
	const userId = req.user._id || req.body.id;
	// Delete all khatas associated with the given userId
	const deletionResult = await Khata.deleteMany({ userId: userId });
	res.send(deletionResult); // Sending deletion result as response
	// Handle any errors that might occur during deletion
});

router.delete('/deleteAllTransactions', auth, async (req, res) => {
	const userId = req.user._id || req.body.id;
	const deletionResult = await Transaction.deleteMany({ userId: userId });
	res.send('done deleted');
});

router.post('/fakelogin', async (req, res) => {
	const user = new User(req.body);
	const output = await user.save();
	const token = output.generateAuthToken();
	res.header('x-auth-token', token).send(output);
});

router.post('/fakedelete', async (req, res) => {
	await Khata.deleteMany({ userPhoneNumber: req.body.phoneNumber });
	await Khata.deleteMany({ friendPhoneNumber: req.body.phoneNumber });
	let user = await User.remove({ phoneNumber: req.body.phoneNumber }); //for token regeneration hence not one lien do
	res.send(user);
});

router.put('/removenameandprofile', auth, async (req, res) => {
	let user = await User.findById(req.user._id); //for token regeneration hence not one lien do
	if (!user) {
		res.status(400).send({ message: 'No User exits' });
	} else {
		// Update the document
		user.name = undefined;
		user.profilePictureUrl = undefined;

		const user2 = await user.save();
		const token = user2.generateAuthToken();
		res.header('x-auth-token', token).send(user2);
	}
});

module.exports = router;

/*
validation all before insert optimized ->validEntries and invalidEntries with errormessgae
insertMany non optmized as error message also feisbale form result print part as JSON.stringify(obj)
but whichlocalId which message
so depending on how client handle can proceed or skip other wise customized error vs performance is trade-off
or alternate good client check and joi validatio and use this for default another api for single for more customize error response in case of invalid+saved<Entries
*/
/*
router.post('/multiple2',auth,async(req,res)=>{
  //const result = validateKhataArray(req.body);
    //get id and Number form user object so to imply safety (allowed Api and same time consistency of id as not from client)
  const userId = req.user._id;
  const userPhoneNumber = req.user.phoneNumber;
  const userName = req.user.name; 
    
//print valid entry ,invalid entryes 
//then saved unsaved entries

//earlieir input was khataEntries replace that with req.body
      const { validEntries, invalidEntries } = validateKhataArray(req.body);
console.log("***********************************");
console.log(validEntries);
console.log("***********************************1");
console.log(invalidEntries);
console.log("***********************************2");

//req.body.map
//validEntries
const khataEntries = req.body.map((entry) => {
      return new Khata({
        ...entry,
        userId,
        userPhoneNumber,
        userName,
      });
    });

      const result = await Khata.insertMany(khataEntries,{ ordered: false,rawResult:true,throwOnValidationError:true } );
      console.log(JSON.stringify(result));
      //console.log(result.mongoose.validationErrors[1].message);
    const savedEntries = [];
    const unsavedEntries = [];
//here also on validKhataEntries
 Object.keys(result.insertedIds).forEach(key => {
      const index = Number(key);
      const entry = khataEntries[index];
      const insertedId = result.insertedIds[key];

      if (insertedId) {
        savedEntries.push(entry);
      } else {
        const unsavedEntry = { ...entry };
        unsavedEntry.errormessage = result.mongoose.validationErrors[index]?.message || 'Unknown error';
        unsavedEntries.push(unsavedEntry);
      }
    });

//errormessage: result.mongoose.validationErrors[i] ? result.mongoose.validationErrors[i].message : 'Unknown error',
console.log(result)
console.log(savedEntries)
console.log(unsavedEntries)

    res.send({ savedEntries, unsavedEntries, invalidEntries });
      //res.send(output);
    //}
});
*/
