const mongoose = require('mongoose');
const Joi = require('joi');
//bit of in consistence as Joi crieteria is more strict to mongoose schema required statement
const OTPSchema = new mongoose.Schema({
	phoneNumber:{
		type:String,
		required:true,
		match: /^[0-9]{10}$/
	},
	otp:{
		type:String,
		required:true
	}
});
const Otp = mongoose.model('Otp',OTPSchema);
//otp here 4 in joi and after hash different in mongodb
function validatelogin(req){
	const schema=Joi.object({
	phoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	otp:Joi.string().regex(/^[0-9]{4}$/).messages({'string.pattern.base': `OTP  must have 4 digits.`}).required(),

	});
	return schema.validate(req);
};

//helper function used to validate input for generateOTP
function validateNumber(req){
	const schema=Joi.object({
	phoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required()
	});
	return schema.validate(req);
}
exports.validatelogin =validatelogin;
exports.validateNumber =validateNumber;

module.exports.Otp =Otp;