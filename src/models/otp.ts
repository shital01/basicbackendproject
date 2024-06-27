const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
	phoneNumber: {
		type: String,
		required: true,
		match: /^[0-9]{10}$/,
	},
	otp: {
		type: String,
		required: true,
	},
});
const Otp = mongoose.model('Otp', OTPSchema);

module.exports.Otp = Otp;
