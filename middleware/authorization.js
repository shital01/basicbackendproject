const jwt = require('jsonwebtoken');
const config = require('config');
//put [auth,authorization] such as delete apis->wiht isadmin or roles or operations array
function authorization (req,res,next){
	//401 unauthorized
	//403 Forbidden
	if(!req.user.isAdmin) return res.status(403).send({error:{message:'Access denied'}})

	//if(!req.user.isAdmin) return res.status(403).send('Access denied')
	next();
}

module.exports = authorization;