import Joi from 'joi';
import JoiObjectId from "joi-objectid";
const myJoiObjectId = JoiObjectId(Joi);


import mongoose from 'mongoose';
const { khataSchema } = require('../utils/validations/khataValidations');

const isValidUnixTimestamp = (value) => {
	const timestamp = new Date(value); // Convert seconds to milliseconds
	return !isNaN(timestamp.getTime());
};

const KhataSchema = new mongoose.Schema({
	deviceId: { type: String },
	userName: { type: String, required: true, minLength: 1, maxLength: 64 },
	friendName: { type: String, required: true, minLength: 1 },
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	friendPhoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
	userPhoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
	interestRate: { type: Number, min: 0, max: 100, default: 0 }, //same
	interestType: {
		type: String,
		required: true,
		enum: ['N', 'CW', 'CM', 'CY'],
	}, //0,7,30,365
	rotationPeriod: {
		type: String,
		enum: ['0M', '3M', '6M', '18M', '1Y', '2Y'],
	}, //30,60,90,180,365,730
	updatedTimeStamp: {
		type: Number,
		required: true,
		validate: [isValidUnixTimestamp, 'Invalid Unix timestamp'],
		default: function () {
			return Date.now();
		},
	},
	localId: { type: String },
	settledFlag: { type: Boolean, default: false },
	interest: { type: Number, default: 0 },
});

const Khata = mongoose.model('Khata', KhataSchema);

function validateKhata(khata) {
	const schema = khataSchema;
	return schema.validate(khata);
}

exports.Khata = Khata;
exports.validate = validateKhata;
