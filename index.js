const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const express = require('express');
const app = express();
const winston = require('winston');

require('./startup/config')();
const logger = require('./startup/logging');
//optional for staging if later feel need
if (
	app.get('env') === 'production' ||
	app.get('env') === 'staging' ||
	app.get('env') === 'loadtest' ||
	app.get('env') === 'development'
) {
	require('./startup/prod')(app);
	app.use((req, res, next) => {
		const start = Date.now();
		res.on('finish', () => {
			const responseTime = Date.now() - start;
			const userAgent = req.headers['user-agent'] || 'Unknown';
			const authToken = req.headers['x-auth-token'] || 'N/A'; //maybe avoid and do this for erroror to seelog of unwanted request whomaking

			//reqq,header->deviceID,appversion,response

			logger.info(
				`${JSON.stringify(req.body)} - ${JSON.stringify(req.headers)}`,
			);

			logger.info(
				`${req.ip} - ${userAgent} - Auth Token: ${authToken} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`,
			);
			//console.log(`${req.ip} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`);
		});
		next();
	});
}
// Define a health check route
app.get('/health', (req, res) => {
	// You can perform custom health checks here
	// For a basic health check, you can just send a success response
	res.status(200).send('Health check passed');
});

process.on('unhandledRejections', (ex) => {
	//console.log(ex)
	throw ex; //convert unhandled to uncaught for winston
});

//set DEBUG=app:startup,set by NODE_ENV=development
if (app.get('env') === 'development' || app.get('env') === 'test') {
	const morgan = require('morgan');
	app.use(morgan('tiny'));
	//app.use(morgan('dev'));

	startupDebugger('Morgan enabled...');
}

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validate')();

//not work as already return otherwise move this code it will show authentication
/*
app.use(function(req,res,next){
	winston.info('authentication ...');
	next();
});
*/

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
	logger.info(`listening to port ${port}...`),
);
module.exports = server;
