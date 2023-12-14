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
	interestRate:{type:Number,min:0,max:100,default:0},//same
	interestType:{type:String,required:true,enum:['N',,'CW','CM','CY']},//0,7,30,365
	rotationPeriod:{type:String,enum:['0M','3M','6M','18M','1Y','2Y']},//30,60,90,180,365,730
	updatedTimeStamp: {
    type: Number,
    required: true,
    validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
    default: function() {
    return Date.now();
  } 
  },
  localId:{type:String},
  settledFlag:{type:Boolean,default:false}
});

const Khata = mongoose.model('Khata',KhataSchema);

function validateGetKhata(khata){
	const schema=Joi.object({
	lastUpdatedTimeStamp:Joi.date().timestamp('unix'),
	pageSize:Joi.number().integer().max(10000),
	pageNumber:Joi.number().integer()	
	});
	return schema.validate(khata);
}


function validateKhata(khata){
	const schema=Joi.object({
	friendName:Joi.string().min(1).required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	interestRate:Joi.number().min(0).max(100),
	interestType:Joi.string().valid('N', 'CY', 'CW', 'CM').required(),
	rotationPeriod:Joi.string().valid('0M','3M','6M','18M','1Y','2Y'),
	localId:Joi.string().required(),
	settledFlag:Joi.boolean()
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
      interestType: Joi.string().valid( 'N', 'CY', 'CW', 'CM').required(),
      rotationPeriod: Joi.string().valid('3M','6M','1Y','2Y').required(),
      localId:Joi.string().required(),
      settledFlag:Joi.boolean()

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
	settledFlag:Joi.boolean().valid(true)
	});
	return schema.validate(khata);
}
exports.validateKhataArray = validateKhataArray;

exports.Khata = Khata;
exports.validateGetKhata = validateGetKhata;
exports.validate = validateKhata;

exports.validateUpdateKhata = validateUpdateKhata;