const jwt = require('jsonwebtoken');
const config = require('config');
function auth (req,res,next){
	const token = req.header('x-auth-token');
	if(!token) return res.status(401).send({error:{message:'Access denied NO token Provided'}});
	try{
	const decoded =	jwt.verify(token,config.get('jwtPrivateKey'));
	req.user =decoded;
	next();
	}
	catch(ex){
		res.status(400).send({error:{message:'Invalid Token'}})
	}
}

module.exports = auth;