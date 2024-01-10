const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	name:{type:String,maxLength:64},
	phoneNumber:{type:String,unique:true,required:true,match: /^[0-9]{10}$/},
	profilePictureUrl:{type:String},
	fcmToken:{type:String},
	contactsSent:{type:Boolean,default: false}
});

UserSchema.methods.generateAuthToken = function(){
	const token = jwt.sign({_id:this._id,name:this.name,phoneNumber:this.phoneNumber,contactsSent:this.contactsSent,fcmToken:this.fcmToken},config.get('jwtPrivateKey'));
	return token;
}
const User = mongoose.model('User',UserSchema);

module.exports.User =User;