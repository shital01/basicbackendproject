// import express from 'express';
// const router = express.Router();
// import mongoose from 'mongoose';
// const dbDebugger = require('debug')('app:db');
// const { Dummy } = require('../models/dummy');
// //const moment = require('moment');
// function generateRandomData(numObjects) {
// 	const dummyData = [];
// 	const startTimestamp = 1609545600000; // Start timestamp
// 	const endTimestamp = Date.now(); // Current timestamp or your desired end date
// 	const interestPeriods = [30, 365]; // Available interest periods

// 	for (let i = 0; i < numObjects; i++) {
// 		const principalAmount = Math.floor(Math.random() * 99990000 + 10000); // Random amount up to 99.99 crores
// 		const giveDate =
// 			Math.floor(Math.random() * (endTimestamp - startTimestamp)) +
// 			startTimestamp;
// 		const interestRate = Math.floor(Math.random() * 100); // Random interest rate up to 100
// 		const interestPeriod =
// 			interestPeriods[Math.floor(Math.random() * interestPeriods.length)]; // Random interest period
// 		const rotationPeriod = [90, 180, 365][Math.floor(Math.random() * 3)]; // Random rotation period

// 		dummyData.push({
// 			principalAmount,
// 			giveDate,
// 			interestRate,
// 			interestPeriod,
// 			rotationPeriod,
// 		});
// 	}

// 	return dummyData;
// }

// const generatedData = generateRandomData(100); // Generate 20 random objects
// //console.log(generatedData);

// async function dummyDump() {
// 	const result = await Dummy.insertMany(generatedData, { ordered: false });
// 	console.log(result);
// }

// router.post('/multiple', async (req: any, res: any) => {
// 	const result = await Dummy.insertMany(req.body, { ordered: false });
// });

// /***************************************************Modified*******************************/

// function calculaterhelper(
// 	amount,
// 	testDate,
// 	interestRate,
// 	interestPeriod,
// 	rotationPeriod,
// 	testdate,
// 	olddata,
// 	olddates,
// ) {
// 	const todaydate = testdate;
// 	var startDate = testDate;
// 	var pendingdays;
// 	var rotation = 0;
// 	var flag = true;
// 	var datearr = olddates;
// 	var amountarr = olddata;
// 	var lastdate;

// 	var f = 1;
// 	if (interestPeriod == 365 && rotationPeriod != 365) {
// 		f = rotationPeriod / 360;
// 	} else if (interestPeriod != 365 && rotationPeriod == 365) {
// 		f = 360 / interestPeriod;
// 	} else if (interestPeriod != 365 && rotationPeriod != 365) {
// 		f = rotationPeriod / interestPeriod;
// 	}

// 	while (flag) {
// 		//console.log(startDate)
// 		startDate.setMonth(startDate.getMonth() + rotationPeriod / 30);
// 		if (startDate > todaydate) {
// 			lastdate = startDate;
// 			startDate = startDate.setMonth(
// 				startDate.getMonth() - rotationPeriod / 30,
// 			);

// 			pendingdays =
// 				Math.floor(todaydate / (24 * 3600000)) -
// 				startDate / (24 * 3600000);
// 			flag = false;
// 			break;
// 		} else {
// 			amount = amount * (1 + (interestRate * f) / 100);
// 			amountarr.push(amount);
// 			rotation++;
// 			datearr.push(new Date(startDate));
// 			//console.log(datearr);
// 		}
// 	}
// 	//console.log(amountarr,datearr);
// 	//console.log(startDate,rotationPeriod,testDate,new Date(todaydate))
// 	return { amountarr, datearr, rotation, amount, pendingdays };
// }

// async function calculateTotalAmount() {
// 	try {
// 		// Get all documents from the Dummy collection
// 		const allTransactions = await Dummy.find({});
// 		// Calculate the total amount
// 		let totalAmount = 0;
// 		allTransactions.forEach(async (transaction) => {
// 			//console.log("for this entry ",transaction);
// 			const principalAmount = transaction.principalAmount;
// 			const interestRate = transaction.interestRate;
// 			const interestPeriod = transaction.interestPeriod;
// 			const giveDate = transaction.giveDate;
// 			const rotationPeriod = transaction.rotationPeriod;
// 			const olddata = transaction.amountArr;
// 			const olddates = transaction.dateArr;
// 			var testdate;
// 			testdate = Date.now();
// 			var startamount;
// 			//testdate = new Date("2022-08-08T00:00:00.000Z");
// 			var inputDate;
// 			if (olddates.length === 0) {
// 				inputDate = new Date(giveDate);
// 			} else {
// 				// Find the last date in the olddates array
// 				inputDate = new Date(Math.max(...olddates));
// 			}
// 			if (olddata.length === 0) {
// 				startamount = principalAmount;
// 			} else {
// 				// Find the last date in the olddates array
// 				startamount = Math.max(...olddata);
// 			}
// 			const n = calculaterhelper(
// 				startamount,
// 				inputDate,
// 				interestRate,
// 				interestPeriod,
// 				rotationPeriod,
// 				testdate,
// 				olddata,
// 				olddates,
// 			); //return n,d
// 			totalAmount =
// 				n.amount *
// 				(1 + (interestRate * n.pendingdays) / (interestPeriod * 100));
// 			console.log(
// 				'Final Result ',
// 				principalAmount,
// 				interestRate,
// 				n.rotation,
// 				n.pendingdays,
// 				totalAmount,
// 			);
// 			transaction.amountArr = n.amountarr;
// 			transaction.dateArr = n.datearr;
// 			transaction.pendingDays = n.pendingdays;
// 			await transaction.save();
// 		});
// 	} catch (error) {
// 		console.error('Error calculating total amount:', error);
// 	}
// }

// async function deletedata() {
// 	try {
// 		const allTransactions = await Dummy.find({});
// 		allTransactions.forEach(async (transaction) => {
// 			transaction.amountArr = [];
// 			transaction.dateArr = [];
// 			transaction.pendingDays = 0;
// 			await transaction.save();
// 		});
// 	} catch (error) {
// 		console.error('Error calculating total amount:', error);
// 	}
// }

// /*
// deletedata();
// console.log("Calculation 01");
// calculateTotalAmount();
// console.log("Calculation 02");
// calculateTotalAmount2();
// console.log("Calculation 03");
// calculateTotalAmount3();
// */
// module.exports = router;
