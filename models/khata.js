const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const mongoose = require('mongoose');

const isValidUnixTimestamp = (value) => {
  const timestamp = new Date(value); // Convert seconds to milliseconds
  return !isNaN(timestamp.getTime());
};

const KhataSchema = new mongoose.Schema({
	userName:{type:String,required:true,minLength:1,maxLength:64},
	friendName:{type:String,required:true,minLength:1},
	userId:{
			type:mongoose.Schema.Types.ObjectId,
			ref:'User',
			required:true
		},
	friendPhoneNumber:{type:String,required:true,match: /^[0-9]{10}$/},
	userPhoneNumber:{type:String,required:true,match: /^[0-9]{10}$/},
	interestRate:{type:Number,required:true,min:0,max:100,default:0},
	interestType:{type:String,required:true,enum:['N','S','CW','CM','CY']},
	rotationPeriod:{type:String,required:true,enum:['3M','6M','1Y','2Y']},
	updatedTimeStamp: {
    type: Number,
    required: true,
    validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
    default:Math.floor(Date.now())
  },
  localId:{type:String}
});

const Khata = mongoose.model('Khata',KhataSchema);

function validateKhata(khata){
	const schema=Joi.object({
	friendName:Joi.string().min(1).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	interestRate:Joi.number().required().min(0).max(100).required(),
	interestType:Joi.string().valid('S', 'N', 'CY', 'CW', 'CM').required(),
	rotationPeriod:Joi.string().valid('3M','6M','1Y','2Y').required(),

	});
	return schema.validate(khata);
}

function validateKhata2(khata){
	const schema=Joi.object({
	friendName:Joi.string().min(1).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	interestRate:Joi.number().required().min(0).max(100).required(),
	interestType:Joi.string().valid('S', 'N', 'CY', 'CW', 'CM').required(),
	rotationPeriod:Joi.string().valid('3M','6M','1Y','2Y').required(),
	localId:Joi.string().required()
	});
	return schema.validate(khata);
}

function validateKhataArray(khatas) {
  const schema = Joi.array().items(
    Joi.object({
      friendName: Joi.string().min(1).required(),
      friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({ 'string.pattern.base': `Phone number must have 10 digits.` })
        .required(),
      interestRate: Joi.number().required().min(0).max(100).required(),
      interestType: Joi.string().valid('S', 'N', 'CY', 'CW', 'CM').required(),
      rotationPeriod: Joi.string().valid('3M','6M','1Y','2Y').required(),
    })
  );

  return schema.validate(khatas);
}

function validateUpdateKhata(khata){
	const schema=Joi.object({
			khataId:Joi.objectId().required(),
	friendName:Joi.string().min(1),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}),
	interestRate:Joi.number().min(0).max(100),
	interestType:Joi.string().valid('S', 'N', 'CY', 'CW', 'CM'),
	rotationPeriod:Joi.string().valid('3M','6M','1Y','2Y'),

	});
	return schema.validate(khata);
}
exports.validateKhataArray = validateKhataArray;

exports.Khata = Khata;
exports.validate = validateKhata;
exports.validate2 = validateKhata2;

exports.validateUpdateKhata = validateUpdateKhata;