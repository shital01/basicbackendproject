const express = require('express');
const router = express.Router();
const { Contact } = require('../models/contact');
const { contactSchema } = require('../utils/validations/contactValidation');
const validateRequest = require('../middleware/validateRequest');

const auth = require('../middleware/auth');

//keep track so extra not send and also reduce return data,version 2 as not inconsistency occurs
//use C,P,N to reduce size
//check size of array for limitation
router.post('/addcontacts', auth, validateRequest({ body: contactSchema }), async (req, res, next) => {
	req.body.CN = req.user.name;
	req.body.CP = req.user.phoneNumber;
	documents = req.body.C; //Contacts
	//console.log('CP:', req.body.CP);
	//console.log('CN:', req.body.CN);

	// Add a new field to all documents with the same value
	documents.forEach((document) => {
		document.contactProviderNumber = req.body.CP; //ContactProviderNumber
		document.contactProviderName = req.body.CN; //ContactProviderName
	});
	try {
		var results = await Contact.insertMany(documents, {
			ordered: false,
		});
		res.send({ success: true });
	} catch (error) {
		if (error.code === 11000) {
			res.send({ success: true });
			// Log the duplicate error silently
			//logger.debug("Ignoring duplicate entry error:", error.message);
			// Continue execution without calling next(error)
		}
	}
	//console.log(results)
});

module.exports = router;
