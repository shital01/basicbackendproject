import mongoose from 'mongoose';
import Joi from 'joi';
//bit of in consistence as Joi crieteria is more strict to mongoose schema required statement

const ContactSchema = new mongoose.Schema({
	P: {
		type: String,
		unique: true,
		required: true,
	},
	N: {
		type: String,
		required: true,
	},
	contactProviderNumber: {
		type: String,
		required: true,
		match: /^[0-9]{10}$/,
	},
	contactProviderName: {
		type: String,
		required: true,
		maxLength: 64,
	},
});
const Contact = mongoose.model('Contact', ContactSchema);
//skip validation in validate contacts

exports.Contact = Contact;
