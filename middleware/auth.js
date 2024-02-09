const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../startup/logging');

function auth (req,res,next){
	const token = req.header('x-auth-token');
	if(!token) {
		logger.error("Access denied NO token Provided");
		return res.status(401).send({code:'no token',message:'Access denied NO token Provided'});
	}
	try{
	const decoded =	jwt.verify(token,config.get('jwtPrivateKey'));
	req.user =decoded;
	next();
	}
	catch(ex){
		logger.error("Invalid token Provided");
		res.status(400).send({code:'Invalid token',message:'Invalid Token'})
	}
}

module.exports = auth;