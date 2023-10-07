const Joi = require('joi');

//helper function used to validate input for generateOTP
function validateMessage(req){
	const schema=Joi.object({
			userName:Joi.string(),
	userPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	amount:Joi.number().integer().required(),
	totalAmount:Joi.number().integer().required()
	});
	return schema.validate(req);
}

//helper function used to validate input for generateOTP
function validateDeleteMessage(req){

	const schema=Joi.object({
			userName:Joi.string(),
	userPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	amount:Joi.number().integer().required(),
	transactionDate:Joi.date(),
	totalAmount:Joi.number().integer().required()
	});
	return schema.validate(req);
}

//helper function used to validate input for generateOTP
function validateRemindMessage(req){
	const schema=Joi.object({
			userName:Joi.string(),
	userPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	totalAmount:Joi.number().integer().required()
	});
	return schema.validate(req);
}

exports.validateMessage =validateMessage;
exports.validateRemindMessage =validateRemindMessage;
exports.validateDeleteMessage =validateDeleteMessage;