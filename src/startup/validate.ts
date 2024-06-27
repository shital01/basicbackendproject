import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
module.exports = function () {
	const myJoiObjectId = JoiObjectId(Joi);
};
