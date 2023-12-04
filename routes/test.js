const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Dummy} = require('../models/dummy');
//const moment = require('moment');
function generateRandomData(numObjects) {
  const dummyData = [];
  const startTimestamp = 1609545600000; // Start timestamp
  const endTimestamp = Date.now(); // Current timestamp or your desired end date
  const interestPeriods = [30, 365]; // Available interest periods

  for (let i = 0; i < numObjects; i++) {
    const principalAmount = Math.floor(Math.random() * 99990000 + 10000); // Random amount up to 99.99 crores
    const giveDate = Math.floor(Math.random() * (endTimestamp - startTimestamp)) + startTimestamp;
    const interestRate = Math.floor(Math.random() * 100); // Random interest rate up to 100
    const interestPeriod = interestPeriods[Math.floor(Math.random() * interestPeriods.length)]; // Random interest period
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


async function dummyDump(){
    const result = await Dummy.insertMany(generatedData,{ ordered: false } );
    console.log(result)
}



router.post('/multiple', async (req, res) => {
     const result = await Dummy.insertMany(req.body,{ ordered: false } );
});

async function calculateTotalAmount() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});
    // Calculate the total amount
    let totalAmount = 0;
    //NOte-01
    allTransactions.forEach((transaction) => {
      const { principalAmount, interestRate, interestPeriod, giveDate, rotationPeriod } = transaction;
      const timeElapsed = Math.floor((Math.floor(Date.now()) - giveDate)/(24*60*60*1000));//Note-02 look for possible optimizations
      const n = Math.floor(timeElapsed/rotationPeriod);
      const d = timeElapsed % rotationPeriod;
         const CompountInterest=principalAmount * Math.pow(1 + (interestRate*rotationPeriod)/ (100*interestPeriod), n)
         const fractionInterest = (interestRate*d)/(interestPeriod*100);
         const finalAmountForThisTransaction = CompountInterest*(1+fractionInterest)
        console.log(principalAmount ,interestRate ,finalAmountForThisTransaction)   
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

async function calculateTotalAmountAggregator() {
  try {
  	const date1= Math.floor(Date.now());
  	console.log(date1);
    const totalAmountAggregate = await Dummy.aggregate([
    	
      {
        $project: {
          principalAmount: 1,
          interestRate: 1,
          interestPeriod: 1,
          giveDate: 1,
          rotationPeriod: 1,
        },
      },
      {
        $addFields: {
          timeElapsed: {
            $floor: {
              $divide: [
                {
                  $subtract: [date1, '$giveDate'],
                },
                24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          n: {
            $floor: {
              $divide: ['$timeElapsed', '$rotationPeriod'],
            },
          },
          d: {
            $mod: ['$timeElapsed', '$rotationPeriod'],
          },
        },
      },
      {
        $addFields: {
          compoundInterest: {
            $multiply: [
              '$principalAmount',
              {
                $pow: [
                  {
                    $add: [
                      1,
                      {
                        $divide: [
                          {
                            $multiply: ['$interestRate', '$rotationPeriod'],
                          },
                          {
                            $multiply: ['$interestPeriod', 100],
                          },
                        ],
                      },
                    ],
                  },
                  '$n',
                ],
              },
            ],
          },
          fractionInterest: {
            $divide: [
              {
                $multiply: ['$interestRate', '$d'],
              },
              {
                $multiply: ['$interestPeriod', 100],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          finalAmountForThisTransaction: {
            $multiply: [
              '$compoundInterest',
              {
                $add: [1, '$fractionInterest'],
              },
            ],
          },
        },
      },
      {
        $project: {
          principalAmount: 1,
          interestRate: 1,
          interestPeriod: 1,
          giveDate: 1,
          rotationPeriod: 1,
          finalAmountForThisTransaction:1
        },
      }
    ]);

    console.log("aggregator Calculations   ");
    console.log(totalAmountAggregate);
  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}
/*
//deletedata();
dummyDump();
console.log("Calculation 01");
calculateTotalAmount();
console.log("Calculation 02");
calculateTotalAmountAggregator();
/*
console.log("Calculation 03");
calculateTotalAmount3();
*/
module.exports =router;