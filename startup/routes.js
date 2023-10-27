const express = require('express');

const users = require('../routes/users');
const khatas = require('../routes/khatas');
const transactions = require('../routes/transactions');
const otps = require('../routes/otps');
const uploadroutes = require('../routes/uploadroutes');
const sendsms = require('../routes/sendsms');
const contacts = require('../routes/contact');
const admin = require('../routes/admin');


const tests = require('../routes/test');


const helmet = require('helmet');
const error = require('../middleware/error')

module.exports = function(app){
	app.use(express.json());//to set post request
	app.use(express.urlencoded({extended:true}));//post ,x-html form to  body 
	app.use(express.static('public'));//for allow all public folder asset to be accesed by url
	app.use(helmet());
	app.use('/api/admin',admin);

	app.use('/api/sms',sendsms);
	app.use('/api/users',users);
	app.use('/api/contact',contacts);
	app.use('/api/khatas',khatas);

	app.use('/api/test',tests);

	app.use('/api/transactions',transactions);
	app.use('/api/otps',otps);
	app.use('/api/uploadurlrequest',uploadroutes);

	app.use(error);
}