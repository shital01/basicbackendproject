const mongoose = require('mongoose');
const Joi = require('joi');
//bit of in consistence as Joi crieteria is more strict to mongoose schema required statement

const ContactSchema = new mongoose.Schema({
	P:{
		type:String,
		required:true
	},
	N:{
		type:String,
		required:true
	},
	contactProviderNumber:{
		type:String,
		required:true,
		match: /^[0-9]{10}$/
	},
	contactProviderName:{
		type:String,
		required:true,
		maxLength:64
	}
});
const Contact = mongoose.model('Contact',ContactSchema);
//skip validation in validate contacts
function validateContacts(contacts){
	const schema=Joi.object({
  C: Joi.array().items(
    Joi.object({
      P: Joi.string(),
      N: Joi.string()
    })
  )
});

	return schema.validate(contacts);
}

exports.Contact =Contact;
exports.validateContacts =validateContacts;
