const config = require('config');
const winston = require('winston');
//for commit
require	('express-async-errors');
require('winston-mongodb');
const { combine, timestamp, json, errors } = winston.format;
//console.log(config.get('db'))
//exception handle 
//and unhandled rejection-random error or promise unhandled
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.File({ filename:  config.get('file1') }),
   winston.add(new winston.transports.MongoDB({ db: config.get('db'), level: 'error',options:{useUnifiedTopology:true }})),

],

  exceptionHandlers: [
    new winston.transports.File({ filename: config.get('file2') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: config.get('file3') }),
  ],

});
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    colorize:true,prettyPrint:true
  }));
}

module.exports = logger;
