const express = require('express');
const router = express.Router();

const {
	Transaction,
	validate2,
} = require('../models/transaction');
const { User } = require('../models/user');
const { Khata } = require('../models/khata');

const auth = require('../middleware/auth');
const device = require('../middleware/device');

const logger = require('../startup/logging');
//Notification firing test
const sendnotification = require('../middleware/notification');
const sendmessage = require('../middleware/sendmessage');
const config = require('config');
const { validateRequest } = require('../middleware/validateRequest');
const { getTransactionsSchema, updateSeenStatusSchema, getTransactionsSchemaV2 } = require('../utils/validations/transactionValidations');
// Create separate validation functions
/*
Input->Auth token
Output->Objects of Transactions in sorted order
Procedure->Query Using Phone Number and date to get info of transaction which are related to particular user and 
*/
//,
router.get(
	'/',
	auth,
	device,
	validateRequest({ query: getTransactionsSchema }),
	async (req, res) => {
		const deviceId = req.header('deviceId');
		var timeStamp = Date.now();
		//adding default pagesize and pagenumber as of now in btoh get api for safety
		var pageSize = 500;
		var pageNumber = 1;
		var nextPageNumber;
		var lastUpdatedTimeStamp;
		var transactions;
		var transactionsUpdatedAfterTimeStamp = req.query.transactionsUpdatedAfterTimeStamp ?? 0;
		if (req.query.pageNumber) {
			pageNumber = req.query.pageNumber;
		}
		if (req.query.pageSize) {
			pageSize = req.query.pageSize;
		}
		if (req.query.lastUpdatedTimeStamp) {
			lastUpdatedTimeStamp = req.query.lastUpdatedTimeStamp;
		}
		const PhoneNumber = req.user.phoneNumber;

		const khatas = await Khata.find({
			$or: [
				{ userPhoneNumber: { $eq: PhoneNumber } },
				{ friendPhoneNumber: { $eq: PhoneNumber } },
			],
		}).lean();

		const filteredKhatas = khatas.filter((khata) => {
			if (khata.lastTransactionUpdatedTimeStamp) {
				return khata.lastTransactionUpdatedTimeStamp > transactionsUpdatedAfterTimeStamp
			}
			return true
		});

		const filteredKhataIds = filteredKhatas.map((khata) => khata._id);

		//watch performance of this ,use limit feature and sort for extra large queries
		if (req.query.lastUpdatedTimeStamp) {
			transactions = await Transaction.find({
				$and: [
					{ khataId: { $in: filteredKhataIds } },
					{ updatedTimeStamp: { $gt: lastUpdatedTimeStamp } },
				],
			})
				.sort('updatedTimeStamp')
				.skip(pageSize * (pageNumber - 1))
				.limit(pageSize); //watch performance of this
		} else {
			transactions = await Transaction.find({ khataId: { $in: filteredKhataIds } })
				.sort({ updatedTimeStamp: 1 })
				.skip(pageSize * (pageNumber - 1))
				.limit(pageSize);
		}
		//.sort({Date:1})
		//dbDebugger(transactions);
		//console.log(transactions)
		if (transactions.length > 0) {
			timeStamp = transactions[transactions.length - 1].updatedTimeStamp;
		}

		var categorizedEntries;
		// Filter by deviceId
		if (req.query.lastUpdatedTimeStamp) {
			categorizedEntries = transactions.reduce(
				(result, entry) => {
					if (entry.deviceId !== deviceId) {
						if (entry.deleteFlag === true) {
							result.deletedEntries.push(entry);
						} else {
							result.newEntries.push(entry);
						}
					}
					return result;
				},
				{ deletedEntries: [], newEntries: [] },
			);
		} else {
			categorizedEntries = transactions.reduce(
				(result, entry) => {
					if (entry.deleteFlag === true) {
						result.deletedEntries.push(entry);
					} else {
						result.newEntries.push(entry);
					}
					return result;
				},
				{ deletedEntries: [], newEntries: [] },
			);
		}

		const { deletedEntries, newEntries } = categorizedEntries;

		if (transactions.length == pageSize) {
			nextPageNumber = parseInt(pageNumber) + 1;
			res.send({
				nextPageNumber: nextPageNumber,
				deletedEntries,
				newEntries,
				timeStamp,
			});
		} else {
			res.send({ deletedEntries, newEntries, timeStamp });
		}
		//res.send(transactions);
	},
);

router.get(
	'/v2',
	auth,
	device,
	validateRequest({ query: getTransactionsSchemaV2 }),
	async (req, res) => {
		const deviceId = req.header('deviceId');
		//adding default pagesize and pagenumber as of now in btoh get api for safety
		var pageSize = req.query.pageSize ?? 500;
		var cursorTimeStamp = req.query.cursorTimeStamp ?? 0;
		var transactionsUpdatedAfterTimeStamp = req.query.transactionsUpdatedAfterTimeStamp ?? 0;
		var nextPageCursorTimeStamp;
		var transactions;
		const PhoneNumber = req.user.phoneNumber;

		const khatas = await Khata.find({
			$or: [
				{ userPhoneNumber: { $eq: PhoneNumber } },
				{ friendPhoneNumber: { $eq: PhoneNumber } },
			],
		}).lean();

		const filteredKhatas = khatas.filter((khata) => {
			if (khata.lastTransactionUpdatedTimeStamp) {
				return khata.lastTransactionUpdatedTimeStamp > transactionsUpdatedAfterTimeStamp
			}
			return true
		});

		const filteredKhataIds = filteredKhatas.map((khata) => khata._id);
		//watch performance of this ,use limit feature and sort for extra large queries
		if (cursorTimeStamp) {
			transactions = await Transaction.find({
				$and: [
					{ khataId: { $in: filteredKhataIds } },
					{ updatedTimeStamp: { $gt: cursorTimeStamp } },
				],
			})
				.sort('updatedTimeStamp')
				.limit(pageSize); //watch performance of this
		} else {
			transactions = await Transaction.find({
				$and: [
					{ khataId: { $in: filteredKhataIds } },
				],
			})
				.sort({ updatedTimeStamp: 1 })
				.limit(pageSize);
		}
		//.sort({Date:1})
		//dbDebugger(transactions);
		//console.log(transactions)
		if (transactions.length > 0) {
			nextPageCursorTimeStamp = transactions[transactions.length - 1].updatedTimeStamp;
		}

		var categorizedEntries;
		// Filter by deviceId
		if (cursorTimeStamp) {
			categorizedEntries = transactions.reduce(
				(result, entry) => {
					if (entry.deviceId !== deviceId) {
						if (entry.deleteFlag === true) {
							result.deletedEntries.push(entry);
						} else {
							result.newEntries.push(entry);
						}
					}
					return result;
				},
				{ deletedEntries: [], newEntries: [] },
			);
		} else {
			categorizedEntries = transactions.reduce(
				(result, entry) => {
					if (entry.deleteFlag === true) {
						result.deletedEntries.push(entry);
					} else {
						result.newEntries.push(entry);
					}
					return result;
				},
				{ deletedEntries: [], newEntries: [] },
			);
		}

		const { deletedEntries, newEntries } = categorizedEntries;

		if (transactions.length == pageSize) {
			res.send({
				nextPageCursorTimeStamp,
				deletedEntries,
				newEntries,
			});
		} else {
			res.send({ deletedEntries, newEntries });
		}
		//res.send(transactions);
	},
);
//muliptle psot
//must limit size of this qeury frontend and backedn
//test for mulitple and khata scripts
router.post('/multiple', auth, device, async (req, res) => {
	const userId = req.user._id;
	const deviceId = req.header('deviceId');

	const userPhoneNumber = req.user.phoneNumber;
	const userName = req.user.name;
	const transactionEntries = req.body;

	const savedEntries = [];
	const unsavedEntries = [];
	//console.log(req.body);
	for (const entry of transactionEntries) {
		// Validate each entry using your validation function (validateKhata)
		const { error } = validate2(entry);
		if (error) {
			unsavedEntries.push({
				...entry,
				error: error.details[0].message,
			});
		} else {
			const { sendSms, ...newEntry } = entry;

			// If validation passes, create a new Khata and save it
			const transaction = new Transaction({
				...newEntry,
				deviceId,
				userId,
				userPhoneNumber,
				userName,
			});

			try {
				const savedEntry = await transaction.save();
				savedEntries.push(savedEntry);
				const khata = await Khata.findById(transaction.khataId).select(
					'userPhoneNumber friendPhoneNumber friendName',
				);
				khata.lastTransactionUpdatedTimeStamp = transaction.updatedTimeStamp;
				await khata.save();

				//send notification
				//console.log(khata);
				var searchPhoneNumber = khata.friendPhoneNumber;
				if (userPhoneNumber === searchPhoneNumber) {
					searchPhoneNumber = khata.userPhoneNumber;
				}
				const user = await User.findOne({
					phoneNumber: searchPhoneNumber,
				}).select('fcmToken');
				//console.log(transaction);
				//console.log(user.fcmToken)
				var smsMessage;
				var templateId;

				var link = 'https://byaj.in/app';

				if (transaction.amountGiveBool) {
					templateId = config.get('templateIdCredit');
					smsMessage =
						'CREDIT: ' +
						userName +
						'(' +
						userPhoneNumber +
						') gave you Rs ' +
						transaction.amount +
						'. \nDetails: ' +
						link +
						' \nByajKhata';
				} else {
					templateId = config.get('templateIdDebit');
					smsMessage =
						'You gave ' +
						userName +
						'(' +
						userPhoneNumber +
						') Rs ' +
						transaction.amount +
						'.Noted in ByajKhata: ' +
						link;
				}
				if (user && user.fcmToken) {
					//console.log("success notifcation")
					var message;
					if (transaction.amountGiveBool) {
						message =
							'CREDIT: I gave you Rs ' + transaction.amount + '.';
						//console.log(user.fcmToken,userName,message)
						const result = sendnotification(
							user.fcmToken,
							userName,
							message,
							userPhoneNumber,
						);
					} else {
						message =
							'DEBIT: You gave me Rs ' + transaction.amount + '.';
						//console.log(user.fcmToken,userName,message)
						const res = sendnotification(
							user.fcmToken,
							userName,
							message,
							userPhoneNumber,
						);
					}

					//const result=sendnotification(user.fcmToken,"title","body","1");
				}
				if (sendSms == true) {
					//config.get('templateIdAdd');
					const SendSMS = await sendmessage(
						'91' + searchPhoneNumber,
						smsMessage,
						templateId,
					);
					//console.log(SendSMS)
				}
				//end of notification
			} catch (err) {
				// Handle any save errors here
				unsavedEntries.push({
					...entry,
					error: err.message,
				});
			}
		}
	}
	//Modify Entry
	if (unsavedEntries.length > 0) {
		logger.error({ unsavedEntries });
	}
	//console.log({ savedEntries, unsavedEntries })

	res.send({ savedEntries, unsavedEntries });
});

//
router.put(
	'/updateSeenStatus',
	auth,
	device,
	validateRequest({ body: updateSeenStatusSchema }),
	async (req, res) => {
		const deviceId = req.header('deviceId');

		const { transactionIds } = req.body;
		// Update seenStatus to true for the provided transactionIds
		const updateResult = await Transaction.updateMany(
			{ _id: { $in: transactionIds } },
			{ $set: { seenStatus: true } }, //, updatedTimeStamp: Date.now()
		);
		// Check if any transactions were updated
		//console.log(updateResult)
		if (updateResult.modifiedCount > 0) {
			const khataIds = (await Transaction.find({ _id: { $in: transactionIds } })).map(
				(transaction) => transaction.khataId,
			)

			res.send({
				message:
					'Seen status updated successfully for specified transactions',
			});
		} else {
			logger.info('No transaction found');
			res.status(404).send({
				code: 'No Transaction',
				message: 'No transactions found for the provided IDs',
			});
		}
	},
);

router.put(
	'/delete',
	auth,
	device,
	validateRequest({ body: updateSeenStatusSchema }),
	async (req, res) => {
		const deviceId = req.header('deviceId');
		const userName = req.user.name;
		const myPhoneNumber = req.user.phoneNumber;
		const { transactionIds } = req.body;
		// Update seenStatus to true for the provided transactionIds
		const updateResult = await Transaction.updateMany(
			{ _id: { $in: transactionIds } },
			{
				$set: {
					deleteFlag: true,
					updatedTimeStamp: Date.now(),
					deviceId,
				},
			},
		);

		// Check if any transactions were updated
		//console.log(updateResult)
		if (updateResult.modifiedCount > 0) {
			// Fetch friend's phone number and send notification
			const transactions = await Transaction.find({
				_id: { $in: transactionIds },
			});
			const khataIds = transactions.map(
				(transaction) => transaction.khataId,
			);


			const khataDetails = await Khata.find({ _id: { $in: khataIds } });

			for (const transaction of transactions) {
				const khata = khataDetails.find((khata) =>
					khata._id.equals(transaction.khataId),
				);
				if (!khata) {
					continue;
				} else {
					await Khata.updateOne(
						{ _id: khata._id },
						{ $set: { lastTransactionUpdatedTimeStamp: transaction.updatedTimeStamp } },
					);
				}
				var searchPhoneNumber = khata.friendPhoneNumber;
				if (myPhoneNumber === searchPhoneNumber) {
					searchPhoneNumber = khata.userPhoneNumber;
				}
				// Fetch additional details like amount, transactionDate, and userName
				const { amountGiveBool, amount, transactionDate } = transaction;
				// Find fcmToken using the friend's phone number
				const user = await User.findOne({
					phoneNumber: searchPhoneNumber,
				});

				if (user && user.fcmToken) {
					// Assuming sendNotificationByToken takes additional parameters for amount, transactionDate, userName
					var message = 'DELETED: ';
					if (amountGiveBool) {
						message =
							message +
							'I gave you Rs ' +
							amount +
							' on ' +
							new Date(transactionDate).toLocaleDateString();
					} else {
						message =
							message +
							'You gave me Rs ' +
							amount +
							' on ' +
							new Date(transactionDate).toLocaleDateString();
					}
					await sendnotification(
						user.fcmToken,
						userName,
						message,
						myPhoneNumber,
					);
				}
				var smsMessage;
				/*
			if(amountGiveBool){


				smsMessage=message+"I gave you Rs "+amount+" on "+new Date(transactionDate).toLocaleDateString();
		  }
		  else{
				smsMessage=message+"You gave me Rs "+amount+" on "+new Date(transactionDate).toLocaleDateString();

		  }

		if(sendSms==true){
				const templateId = config.get('templateIdDelete');
				//config.get('templateIdAdd');
				const SendSMS = await sendmessage("91"+searchPhoneNumber,smsMessage,templateId);
				console.log(SendSMS)
			}
*/
			}
			res.send({
				message:
					'delete status updated successfully for specified transactions',
			});
		} else {
			logger.info('no transaction found');
			res.status(404).send({
				code: 'No Transaction',
				message: 'No transactions found for the provided IDs',
			});
		}
	},
);
module.exports = router;
