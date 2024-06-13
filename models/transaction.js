const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const { transactionSchema, transactionSchema2 } = require('../utils/validations/transactionValidations');
const isValidUnixTimestamp = (value) => {
	const timestamp = new Date(value * 1000); // Convert seconds to milliseconds
	return !isNaN(timestamp.getTime());
};

const TransactionSchema = new mongoose.Schema({
	deviceId: { type: String },
	userName: { type: String, required: true, minLength: 1, maxLength: 64 },
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	khataId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Khata',
		required: true,
	},
	userPhoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
	amount: { type: Number, required: true, min: -1000000000, max: 1000000000 },
	/*,validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for amount.'
    }*/
	amountGiveBool: { type: Boolean, default: true },
	transactionDate: {
		type: Number,
		required: true,
		validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
		default: function () {
			return Date.now();
		},
	},
	updatedTimeStamp: {
		type: Number,
		required: true,
		validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
		default: function () {
			return Date.now();
		},
	},
	updatedFlag: { type: Boolean, default: false },

	deleteFlag: { type: Boolean, default: false },
	seenStatus: { type: Boolean, default: false },

	description: { type: String, maxLength: 500 },
	attachmentsPath: {
		type: [String],
		validate: {
			validator: function (array) {
				return array.length <= 4;
			},
			message: 'Maximum 4 attachments allowed',
		},
	},
	localId: { type: String }, //confirm this type
	createdTimeStamp: {
		type: Number,
		required: true,
		validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
		default: function () {
			return Date.now();
		},
	},
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

function validateTransaction(transaction) {
	const schema = transactionSchema;
	return schema.validate(transaction);
}
function validateTransaction2(transaction) {
	const schema = transactionSchema2;
	return schema.validate(transaction);
}
//can be more sttrict one of them is must and only allowed value is true
//valid workes allow doesnt

//not much point pass all values
//check if iso or without it works
//date proper check now
//max limit 10000 all are optional

exports.Transaction = Transaction;
exports.validate = validateTransaction;
exports.validate2 = validateTransaction2;

