const express = require('express');
//instead of app word router is used
const router = express.Router();
const Joi = require('joi');
const config = require('config');
const {User} = require('../models/user');
const auth =require('../middleware/auth');
const dbDebugger = require('debug')('app:db');

const validateInput = (schema) => (req, res, next) => {
  const { error } = schema(req.body);
  if (error) {
    dbDebugger(error.details[0].message)
    return res.status(400).send(error.details[0]);
  }
  next();
};

router.put('/updateprofile', auth, validateInput(validateUpdateUser), async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(400).send({ message: 'No User exists' });
    } else {
        // Define the fields you want to update
        const fieldsToUpdate = ['name', 'profilePictureUrl', 'fcmToken']; // Add other fields as needed

        // Update user fields dynamically
        fieldsToUpdate.forEach(field => {
            if (req.body[field]) {
                user[field] = req.body[field];
            }
        });

        const updatedUser = await user.save();
        const token = updatedUser.generateAuthToken();
        res.header('x-auth-token', token).send(updatedUser);
    }
});

//friendsprofile pic
router.post('/friendsprofile',auth,validateInput(validateNumbers),async(req,res)=>{
	//add limit on size of array to handle unexpected long requests-also decided by server as not size but query return time also a factor
	const users = await User.find({phoneNumber: { $in: req.body.phoneNumbers}}).select("phoneNumber profilePictureUrl name")
	if(users.length===0) { res.status(404).send({message:'No User exits'})}
	else{res.send(users);}
})

function validateUpdateUser(user){
	const schema=Joi.object({
	name:Joi.string().allow(null, '').max(64),
	profilePictureUrl:Joi.string().allow(null, ''),
	fcmToken:Joi.string().allow(null,'')
	});
	return schema.validate(user);
}
function validateNumbers(req){
	const schema=Joi.object({
	phoneNumbers:Joi.array().items(Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required()).max(10)
	});
	return schema.validate(req);
}

module.exports =router;