const jwt = require('jsonwebtoken');
const config = require('config');
import logger from '../startup/logging';
function device(req, res, next) {
	const deviceId = req.header('deviceId');
	if (!deviceId) {
		logger.error('Access denied NO deviceId Provided');
		return res
			.status(400)
			.send({
				code: 'No deviceId',
				message: 'Access denied NO DeviceId Provided',
			});
	}
	next();
}

module.exports = device;
