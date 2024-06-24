const express = require('express');
//instead of app word router is used
const router = express.Router();
const { User } = require('../models/user');
const { userSchema } = require('../utils/validations/userValidations');
const auth = require('../middleware/auth');
const device = require('../middleware/device');

const logger = require('../startup/logging');
const { validateRequest } = require('../middleware/validateRequest');

router.put(
	'/updateprofile',
	auth,
	device,
	validateRequest({ body: userSchema }),
	async (req, res) => {
		const user = await User.findById(req.user._id);
		//console.log(req.body)

		if (!user) {
			logger.error(req.user._id + ' No such User exits');
			res.status(400).send({
				code: 'No User found',
				message: 'No User exists',
			});
		} else {
			// Define the fields you want to update
			const fieldsToUpdate = [
				'name',
				'profilePictureUrl',
				'fcmToken',
				'contactsSent',
			]; // Add other fields as needed

			// Update user fields dynamically
			fieldsToUpdate.forEach((field) => {
				if (req.body[field]) {
					if (req.body[field] == 'null') {
						req.body[field] = '';
					}
					user[field] = req.body[field];
				}
			});
			//console.log(user);

			const updatedUser = await user.save();
			//console.log(updatedUser);
			const token = updatedUser.generateAuthToken();
			res.header('x-auth-token', token).send(updatedUser);
		}
	},
);
/*
//friendsprofile pic
router.post('/friendsprofile',auth,validateInput(validateNumbers),async(req,res)=>{
	//add limit on size of array to handle unexpected long requests-also decided by server as not size but query return time also a factor
	const users = await User.find({phoneNumber: { $in: req.body.phoneNumbers}}).select("phoneNumber profilePictureUrl name")
	if(users.length===0) { res.status(404).send({message:'No User exits'})}
	else{res.send(users);}
})
function validateNumbers(req){
	const schema=Joi.object({
	phoneNumbers:Joi.array().items(Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required()).max(10)
	});
	return schema.validate(req);
}
*/
module.exports = router;
