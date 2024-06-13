const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middleware/validateRequest');
const { getKhataSchema, unsettleKhataSchema, updateSettleKhataSchema } = require('../utils/validations/khataValidations');
const dbDebugger = require('debug')('app:db');
const {
	Khata,
	validate,
} = require('../models/khata');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const device = require('../middleware/device');

//Validation Start
const logger = require('../startup/logging');
const config = require('config');
const sendmessage = require('../middleware/sendmessage');
const sendNotification = require('../middleware/notification');

//Seperate the middel ware of validation
//validateGetKhata
// Create separate validation functions
const validateInput =
	(schema, query = false) =>
	(req, res, next) => {
		const { error } = query ? schema(req.query) : schema(req.body);
		if (error) {
			logger.error(error.details[0]);
			dbDebugger(error.details[0].message);
			return res
				.status(400)
				.send({
					code: 'validation failed',
					message: error.details[0].message,
				});
		}
		next();
	};

//,validateInput(validateGetKhata)
//PageSize and Page Number to be included in get function
router.get(
	'/',
	auth,
	device,
	validateRequest({ query: getKhataSchema }),
	
	async (req, res) => {
		const deviceId = req.header('deviceId');

		const PhoneNumber = req.user.phoneNumber;
		var khatas;
		//watch performance of this ,use limit feature and sort for extra large queries
		var lastUpdatedTimeStamp;
		var timeStamp = Date.now();
		if (req.query.lastUpdatedTimeStamp) {
			lastUpdatedTimeStamp = req.query.lastUpdatedTimeStamp;
			// console.log(lastUpdatedTimeStamp)
			khatas = await Khata.find({
				$and: [
					{
						$or: [
							{ userPhoneNumber: { $eq: PhoneNumber } },
							{ friendPhoneNumber: { $eq: PhoneNumber } },
						],
					},
					{ updatedTimeStamp: { $gt: lastUpdatedTimeStamp } },
				],
			}).sort({ updatedTimeStamp: 1 });
		} else {
			khatas = await Khata.find({
				$or: [
					{ userPhoneNumber: { $eq: PhoneNumber } },
					{ friendPhoneNumber: { $eq: PhoneNumber } },
				],
			}).sort({ updatedTimeStamp: 1 });
			//dbDebugger(transactions);
		}
		if (khatas.length > 0) {
			timeStamp = khatas[khatas.length - 1].updatedTimeStamp;
		}

		var categorizedEntries;
		if (req.query.lastUpdatedTimeStamp) {
			categorizedEntries = khatas.reduce(
				(result, entry) => {
					if (entry.deviceId !== deviceId) {
						result.newEntries.push(entry);
					}
					return result;
				},
				{ settledEntries: [], updatedEntries: [], newEntries: [] },
			);
		} else {
			categorizedEntries = khatas.reduce(
				(result, entry) => {
					result.newEntries.push(entry);
					return result;
				},
				{ settledEntries: [], updatedEntries: [], newEntries: [] },
			);
		}

		const { settledEntries, updatedEntries, newEntries } =
			categorizedEntries;

		res.send({ settledEntries, updatedEntries, newEntries, timeStamp });
	},
);

router.post('/multiple', auth, device, async (req, res) => {
	const deviceId = req.header('deviceId');
	//console.log(deviceId)
	const userId = req.user._id;
	const userPhoneNumber = req.user.phoneNumber;
	const userName = req.user.name;
	const khataEntries = req.body;
	// logger.info(khataEntries)
	const savedEntries = [];
	const unsavedEntries = [];

	for (const entry of khataEntries) {
		// Validate each entry using your validation function (validateKhata)
		const { error } = validate(entry);
		if (error) {
			unsavedEntries.push({
				...entry,
				error: error.details[0].message,
			});
		} else {
			// If validation passes, create a new Khata and save it
			const khata = new Khata({
				...entry,
				deviceId,
				userId,
				userPhoneNumber,
				userName,
			});

			try {
				const savedEntry = await khata.save();
				savedEntries.push(savedEntry);

				// Send notification to friendPhoneNumber for savedEntry
				const user = await User.findOne({
					phoneNumber: savedEntry.friendPhoneNumber,
				});

				if (user && user.fcmToken) {
					//console.log("came here")
					// Assuming sendNotification takes fcmToken as a parameter
					await sendNotification(
						user.fcmToken,
						savedEntry.userName,
						'Added you to their ByajKhata',
						userPhoneNumber,
					);
				}
			} catch (err) {
				// Handle any save errors here
				unsavedEntries.push({
					...entry,
					error: err.message,
				});
			}
		}
	}
	if (unsavedEntries.length > 0) {
		logger.error({ unsavedEntries });
	}
	//console.log({ savedEntries, unsavedEntries });
	res.send({ savedEntries, unsavedEntries });
});

//,validateInput(validateKhataArray)
//first validation
//then insert many
//save as much as you can rest in error
//overall return structure-failed 1,pass,failed2

//notice performance of mulitple 1 and mulitpel 2 in parts to see whci one need to be optimized

//first without validaiotn return success vs unsuccess but no reason

//if mulitple save query local process or then all check on single side use this to validate then save mulitple

router.put(
	'/unsettle',
	auth,
	device,
	validateRequest({ body: unsettleKhataSchema }),
	async (req, res) => {
		const deviceId = req.header('deviceId');
		const { khataIds } = req.body;
		// Update seenStatus to true for the provided transactionIds
		const updateResult = await Khata.updateMany(
			{ _id: { $in: khataIds } },
			{
				$set: {
					settledFlag: false,
					updatedTimeStamp: Date.now(),
					deviceId,
				},
			},
		);
		// Check if any transactions were updated
		//console.log(updateResult)
		if (updateResult.modifiedCount > 0) {
			res.send({
				message:
					'settled status updated successfully for specified transactions',
			});
		} else {
			logger.info('No Khata found for given ID');
			res.status(404).send({
				code: 'No Khata',
				message: 'No khata found for the provided IDs',
			});
		}
	},
);

//not authenticte checkig -only 2 user can do it

router.put(
	'/settle',
	auth,
	device,
	validateRequest({ body: updateSettleKhataSchema }),
	async (req, res) => {
		const deviceId = req.header('deviceId');
		const userName = req.user.name;
		const phoneNumber = req.user.phoneNumber;
		const { khataObjects } = req.body; // Change from khataIds to khataObjects, assuming the request body has an array of objects

		// Extract IDs from the array of objects
		const khataIds = khataObjects.map((khata) => khata.id);

		// Update each object in the array with settledFlag and interest amount
		const updatePromises = khataObjects.map((khata) => {
			return Khata.updateOne(
				{ _id: khata.id },
				{
					$set: {
						settledFlag: true,
						interest: khata.interest,
						updatedTimeStamp: Date.now(),
						deviceId,
					},
				},
			);
		});

		// Execute all update promises
		const updateResults = await Promise.all(updatePromises);

		// Check if any transactions were updated
		const modifiedCount = updateResults.reduce(
			(count, result) => count + result.modifiedCount,
			0,
		);

		if (modifiedCount > 0) {
			// Retrieve updated khataDetails
			const updatedKhataDetails = await Khata.find({
				_id: { $in: khataIds },
			});

			for (const khata of updatedKhataDetails) {
				const { userPhoneNumber, friendPhoneNumber } = khata;
				const searchPhoneNumber =
					phoneNumber === friendPhoneNumber
						? userPhoneNumber
						: friendPhoneNumber;

				// Find fcmToken using the friend's phone number
				const user = await User.findOne({
					phoneNumber: searchPhoneNumber,
				});

				if (user && user.fcmToken) {
					// Assuming sendNotification takes userName and fcmToken as parameters
					await sendNotification(
						user.fcmToken,
						userName,
						'Account Settled. Updated Balance is Zero',
						phoneNumber,
					);
				}
				var link = 'https://byaj.in/app';
				var smsMessage =
					'Account Settled with ' +
					userName +
					'. Updated Balance is Zero.Noted in ByajKhata: ' +
					link;
				const templateId = config.get('templateIdSettle');
				const SendSMS = await sendmessage(
					'91' + searchPhoneNumber,
					smsMessage,
					templateId,
				);
				// console.log(SendSMS)
			}

			res.send({
				message:
					'Settled status updated successfully for specified transactions',
			});
		} else {
			logger.info('No khata found for provided IDs');
			res.status(404).send({
				code: 'No Khata',
				message: 'No khata found for the provided IDs',
			});
		}
	},
);

module.exports = router;
