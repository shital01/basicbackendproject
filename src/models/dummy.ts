import Joi from 'joi';
import JoiObjectId from "joi-objectid";
const myJoiObjectId = JoiObjectId(Joi);


import mongoose from 'mongoose';

const DummySchema = new mongoose.Schema({
	principalAmount: {
		type: Number,
		required: true,
		min: -1000000000,
		max: 1000000000,
		validate: {
			validator: Number.isInteger,
			message: '{VALUE} is not an integer value for amount.',
		},
	},
	giveDate: {
		type: Number,
		required: true,
	},
	interestRate: {
		type: Number,
		required: true,
		min: 0,
		max: 100,
		default: 0,
	},
	interestPeriod: { type: Number, required: true, enum: [7, 30, 365] },
	rotationPeriod: {
		type: Number,
		required: true,
		enum: [90, 180, 365, 540, 730],
	},
	amountArr: { type: [Number] },
	dateArr: { type: [Number] },
	pendingDays: { type: Number },
});

const Dummy = mongoose.model('Dummy', DummySchema);

exports.Dummy = Dummy;
