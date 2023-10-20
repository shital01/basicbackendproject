const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
	userName:{type:String,required:true,minLength:1,maxLength:64},
	friendName:{type:String,required:true,minLength:1},
	userId:{
			type:mongoose.Schema.Types.ObjectId,
			ref:'User',
			required:true
		},
	friendPhoneNumber:{type:String,required:true,match: /^[0-9]{10}$/},
	userPhoneNumber:{type:String,required:true,match: /^[0-9]{10}$/},
	amount:{type:Number,required:true,min:-1000000000,max:1000000000,validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for amount.'
    }},
    amountGiveBool:{type:Boolean,default:true},
	interestRate:{type:Number,required:true,min:0,max:100,default:0},
	interestType:{type:String,required:true,enum:['N','S','CW','CM','CY']},
	transactionDate:{type:Date,required:true},
	updatedTimeStamp:{type:Date,required:true,default:Date.now()},//for indian timeline
	deleteFlag:{type:Boolean,default:false},
	description:{type:String,maxLength:500},
	attachmentsPath:{
		type: [String], 
	    validate: {
	      validator: function (array) {
	        return array.length <= 4;
	      },
	      message: 'Maximum 4 attachments allowed',
	    },
  },
});

const Transaction = mongoose.model('Transaction',TransactionSchema);

function validateTransaction(transaction){
	const schema=Joi.object({
	friendName:Joi.string().min(1).required(),
	transactionDate:Joi.date().required(),
	friendPhoneNumber:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
	amount:Joi.number().integer().required().min(-1000000000).max(1000000000).required(),
	amountGiveBool:Joi.boolean(),
	interestRate:Joi.number().required().min(0).max(100).required(),
	interestType:Joi.string().valid('S', 'N', 'CY', 'CW', 'CM').required(),
	description:Joi.string().allow(null, '').max(500),
	attachmentsPath:Joi.array().items(Joi.string()).max(4)
	});
	return schema.validate(transaction);
}


function validateDeleteTransaction(transaction){
	const schema=Joi.object({
	transactionId:Joi.objectId().required(),
	});
	return schema.validate(transaction);
}
//not much point pass all values
//check if iso or without it works
function validateRequestTransaction(transaction){
	const schema=Joi.object({
		lastUpdatedTimeStamp:Joi.date().iso().required()
	});
	return schema.validate(transaction);
}
exports.Transaction = Transaction;
exports.validate = validateTransaction;

exports.validateRequestTransaction =validateRequestTransaction;
exports.validateDeleteTransaction =validateDeleteTransaction;