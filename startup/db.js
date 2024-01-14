const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');
const logger = require('./logging');

module.exports = function(){
	 mongoose.set('strictQuery', false);//to check right choice
	 const db = config.get('db')+"?retryWrites=true&w=majority";
mongoose.connect(db,{family: 4,useUnifiedTopology:true})
	.then(()=>logger.info(`Connected to Mongodb...${db}`))//
//	.catch(err => dbDebugger('couldnot connect to mongodb',err))//as not logging enough need to terminate so done seperately
}


