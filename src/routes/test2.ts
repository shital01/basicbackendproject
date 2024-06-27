import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
const dbDebugger = require('debug')('app:db');
const { Dummy } = require('../models/dummy');
//const moment = require('moment');
function generateRandomData(numObjects) {
	const dummyData = [];
	const startTimestamp = 1609545600000; // Start timestamp
	const endTimestamp = Date.now(); // Current timestamp or your desired end date
	const interestPeriods = [30, 365]; // Available interest periods

	for (let i = 0; i < numObjects; i++) {
		const principalAmount = Math.floor(Math.random() * 99990000 + 10000); // Random amount up to 99.99 crores
		const giveDate =
			Math.floor(Math.random() * (endTimestamp - startTimestamp)) +
			startTimestamp;
		const interestRate = Math.floor(Math.random() * 100); // Random interest rate up to 100
		const interestPeriod =
			interestPeriods[Math.floor(Math.random() * interestPeriods.length)]; // Random interest period
		const rotationPeriod = [90, 180, 365][Math.floor(Math.random() * 3)]; // Random rotation period

		dummyData.push({
			principalAmount,
			giveDate,
			interestRate,
			interestPeriod,
			rotationPeriod,
		});
	}

	return dummyData;
}

const generatedData = generateRandomData(100); // Generate 20 random objects
//console.log(generatedData);

async function dummyDump() {
	const result = await Dummy.insertMany(generatedData, { ordered: false });
	console.log(result);
}

router.post('/multiple', async (req: any, res: any) => {
	const result = await Dummy.insertMany(req.body, { ordered: false });
});
/***************************************************Modified*******************************/

function calculaterhelper(giveDate, rotationPeriod) {
	const todaydate = Date.now();
	var startDate = giveDate;
	var pendingdays;
	var rotation = 0;
	var flag = true;
	while (flag) {
		startDate.setMonth(startDate.getMonth() + rotationPeriod);
		if (startDate > todaydate) {
			startDate.setMonth(startDate.getMonth() - rotationPeriod);
			pendingdays =
				Math.floor(todaydate / (24 * 3600000)) -
				startDate / (24 * 3600000);
			flag = false;
			break;
		} else {
			rotation++;
		}
	}
	console.log(startDate, rotationPeriod, giveDate, new Date(todaydate));
	return { rotation, pendingdays };
}

async function calculateTotalAmountwithAdjustedMonthAndYear() {
	try {
		// Get all documents from the Dummy collection
		const allTransactions = await Dummy.find({});
		// Calculate the total amount
		let totalAmount = 0;
		allTransactions.forEach((transaction) => {
			const {
				principalAmount,
				interestRate,
				interestPeriod,
				giveDate,
				rotationPeriod,
			} = transaction;
			const n = calculaterhelper(
				giveDate,
				Math.floor(rotationPeriod / 30),
			); //return n,d
			var f = 1;
			if (interestPeriod == 365 && rotationPeriod != 365) {
				f = rotationPeriod / 360;
			} else if (interestPeriod != 365 && rotationPeriod == 365) {
				f = 360 / interestPeriod;
			} else if (interestPeriod != 365 && rotationPeriod != 365) {
				f = rotationPeriod / interestPeriod;
			}
			//const f = rotationPeriod/interestPeriod;
			totalAmount =
				principalAmount *
				Math.pow(1 + (interestRate * f) / 100, n.rotation) *
				(1 + (interestRate * n.pendingdays) / (interestPeriod * 100));
			console.log(
				principalAmount,
				interestRate,
				interestPeriod,
				rotationPeriod,
				n.rotation,
				n.pendingdays,
				totalAmount,
			);
		});
	} catch (error) {
		console.error('Error calculating total amount:', error);
	}
}
//dummyDump();
console.log('Calculation 01');
//calculateTotalAmountwithAdjustedMonthAndYear();

module.exports = router;
