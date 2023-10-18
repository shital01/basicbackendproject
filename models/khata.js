const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const mongoose = require('mongoose');

const KhataSchema = new mongoose.Schema({
	friendName:{type:String,required:true,minLength:1},
	friendPhoneNumber:{type:String,required:true,match: /^[0-9]{10}$/},
	interestRate:{type:Number,required:true,min:0,max:100,default:0},
	interestType:{type:String,required:true,enum:['N','S','CW','CM','CY']}
});

const Khata = mongoose.model('Khata',KhataSchema);

function validateKhata(khata){
	const schema=Joi.object({
	friendName:Joi.string().min(1).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	interestRate:Joi.number().required().min(0).max(100).required(),
	interestType:Joi.string().valid('S', 'N', 'CY', 'CW', 'CM').required(),
	});
	return schema.validate(khata);
}

exports.Khata = Khata;
exports.validate = validateKhata;