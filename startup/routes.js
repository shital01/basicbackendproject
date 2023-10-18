const express = require('express');

const khatas = require('../routes/khatas');
const uploadroutes = require('../routes/uploadroutes');
const sendsms = require('../routes/sendsms');

const helmet = require('helmet');
const error = require('../middleware/error')

module.exports = function(app){
	app.use(express.json());//to set post request
	app.use(express.urlencoded({extended:true}));//post ,x-html form to  body 
	app.use(express.static('public'));//for allow all public folder asset to be accesed by url
	app.use(helmet())
	app.use('/api/sms',sendsms);
	app.use('/api/khatas',khatas);
	app.use('/api/uploadurlrequest',uploadroutes);

	app.use(error);
}