const express = require('express');
const config = require('config');
const { validateRequest } = require('../middleware/validateRequest');
const { numberSchema, loginSchema } = require('../utils/validations/otpValidations');

const router = express.Router();
const { Otp } = require('../models/otp');
const { User } = require('../models/user');
const { Notebook } = require('../models/notebook');

const logger = require('../startup/logging');

const sendmessage = require('../middleware/sendmessage');

const testGenApi = () => (req, res, next) => {
	if (
		req.body.phoneNumber === '5555543210' ||
		req.body.phoneNumber === '5555566666' ||
		req.body.phoneNumber === '5555544444' ||
		req.body.phoneNumber === '5555533333' ||
		req.body.phoneNumber === '5555522222' ||
		req.body.phoneNumber === '5555511111'
	) {
		return res.send({ SendSMS: true });
	}
	next();
};
const testLoginApi = () => async (req, res, next) => {
	if (
		(req.body.phoneNumber === '5555543210' ||
			req.body.phoneNumber === '5555566666' ||
			req.body.phoneNumber === '5555544444' ||
			req.body.phoneNumber === '5555533333' ||
			req.body.phoneNumber === '5555522222' ||
			req.body.phoneNumber === '5555511111') &&
		req.body.otp == '1234'
	) {
		try {
			let user = await User.findOne({
				phoneNumber: req.body.phoneNumber,
			});

			user.fcmToken = req.body.fcmToken;
			const user2 = await user.save();
			const token = user2.generateAuthToken();
			return res.header('x-auth-token', token).send(user2);
		} catch (error) {
			logger.error('Internal Server error');
			return res.status(500).send({ error: 'Internal Server Error' });
		}
	}
	next();
};
/*helper function to generate OTP for generateOTP api
Input->{}
OutPut->4 digit otp string
*/
function generateOTP() {
	var digits = '0123456789';
	let OTP = '';
	for (let i = 0; i < 4; i++) {
		OTP += digits[Math.floor(Math.random() * 10)];
	}
	//logger.info(OTP)
	//console.log(OTP)
	//dbDebugger(OTP)
	return OTP;
}
//return in eahc res.send but will stop other middelware so use if else blokcs system

router.post(
	'/generate',
	testGenApi(),
	validateRequest({ body: numberSchema }),
	async (req, res, next) => {
		//dummy account direct send true no sms and otp create
		//const salt = await bcrypt.genSalt(10);
		const smsotp = generateOTP();
		//const OTP = await bcrypt.hash(smsotp,salt)
		const otp = new Otp({ phoneNumber: req.body.phoneNumber, otp: smsotp });
		await otp.save();
		//Change SMS Settle APP wording-from provider

		var finalmessage =
			'Here is OTP for login to ByajKhata : ' +
			smsotp +
			' dtX0X3tIlgo ' +
			'. Please do not share it with anyone.';
		const SendSMS = await sendmessage(
			'91' + req.body.phoneNumber,
			finalmessage,
			config.get('templateIdOtp'),
		);
		res.send({ SendSMS });
	},
);

router.post(
	'/verify',
	testLoginApi(),
	validateRequest({ body: loginSchema }),
	async (req, res) => {
		//id is same order as date hence
		console.log(req.body);
		const otps = await Otp.find({
			phoneNumber: req.body.phoneNumber,
			otp: req.body.otp,
		}); //.sort({_id:-1})
		if (otps.length === 0) {
			logger.info(req.body.phoneNumber + ' Invalid OTP ' + req.body.otp);
			return res
				.status(404)
				.send({ code: 'Invalid Otp', message: 'Invalid OTP' });
		}
		//const validotp =await bcrypt.compare(req.body.otp,otps[0].otp)
		//if(!validotp) return res.status(404).send({message:'Invalid OTP'});
		else {
			let user = await User.findOne({
				phoneNumber: req.body.phoneNumber,
			});
			if (user) {
				//current not implemented not so getting latest not much security needed otherwise keep date field and check using
				//created At and moment library
				user.fcmToken = req.body.fcmToken;
				const user2 = await user.save();
				const token = user2.generateAuthToken();
				res.header('x-auth-token', token).send(user2);
			} else {
				user = new User(req.body);
				user.fcmToken = req.body.fcmToken;
				const newuser = await user.save();
				const token = newuser.generateAuthToken();
				await createNotebook(newuser)
				res.header('x-auth-token', token).send(newuser);
			}
		}
	},
);

async function createNotebook(user) {
	const name = user.name ?? "User";
	const result = await Notebook.create({
		name: `${name}'s Notebook`,
		description: 'Personal Notebook',
		ownerId: user._id,
	})
	return result
}

module.exports = router;
