const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Dummy} = require('../models/dummy');
//const moment = require('moment');





router.post('/multiple', async (req, res) => {

 const transactionEntries = req.body;

  const savedEntries = [];
  const unsavedEntries = [];

 for (const entry of transactionEntries) {
    // Validate each entry using your validation function (validateKhata)
   
      // If validation passes, create a new Khata and save it
      const dummy = new Dummy(entry);

         try {
        const savedEntry = await dummy.save();
        savedEntries.push(savedEntry);
      } catch (err) {
        // Handle any save errors here
        unsavedEntries.push({
          ...entry,
          error: err.message,
        });
      }
    
    
}

  res.send({ savedEntries, unsavedEntries });
});
/*
async function calculateTotalAmount() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});

    // Calculate the total amount
    let totalAmount = 0;

    allTransactions.forEach((transaction) => {
      const principalAmount = transaction.principalAmount;
      const interestRate = adjustInterestRate(transaction.interestRate, transaction.interestPeriod);
      const giveDate = transaction.giveDate;
      const compoundPeriod = getCompoundPeriod(transaction.rotationPeriod);

      // Calculate the time elapsed in milliseconds
      const timeElapsed = Date.now() - giveDate.getTime();

      if (timeElapsed > 0) {
        // Calculate the number of compounding periods based on the specific compound period
        const numberOfCompoundingPeriods = Math.floor(timeElapsed / compoundPeriod);
        const leftoverdays =(timeElapsed -numberOfCompoundingPeriods*compoundPeriod)/(24*60*60*1000);
        // Calculate compound interest
        totalAmount =principalAmount * Math.pow(1 + (interestRate*compoundPeriod)/ (100*365*24*60*60*1000), numberOfCompoundingPeriods)*(1+(interestRate*leftoverdays)/(365*100));

        console.log(principalAmount,numberOfCompoundingPeriods,interestRate,leftoverdays ,totalAmount)
      }
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

// Adjust the annual interest rate based on the specified interest type ('W', 'M', 'Y')
function adjustInterestRate(interestRate, interestType) {
  if (interestType === 'W') {
    return interestRate * 52; // Weekly to Annual
  } else if (interestType === 'M') {
    return interestRate * 12; // Monthly to Annual
  }
  return interestRate; // Yearly remains unchanged
}

// Retrieve the compound period based on the value stored in the rotation period field
function getCompoundPeriod(rotationPeriod) {
  // Define the conversion for each rotation period type ('3M', '6M', '1Y', '2Y', etc.)
  const rotationPeriodInMilliseconds = {
    '3M': 3 * 30 * 24 * 60 * 60 * 1000, // 3 months
    '6M': 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
    '1Y': 365 * 24 * 60 * 60 * 1000, // 1 year
    '2Y': 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    // Add more as needed
  };

  return rotationPeriodInMilliseconds[rotationPeriod];
}

// Calculate the total amount
calculateTotalAmount();

//insert dummy data
//aggregate run 
//match
//join these if need
//add of currently implemented NSCWMY....
router.get('/Total', async (req, res) => {

const today = new Date(); // Current date

Dummy.aggregate([
  {
    $project: {
      principalAmount: 1,
      interestRate: 1,
      interestPeriod: 1,
      rotationPeriod: 1,
      giveDate: 1,
      daysPassed: {
        $divide: [
          {
            $subtract: [today, '$giveDate'],
          },
          24 * 60 * 60 * 1000,
        ],
      },
    },
  },
  {
    $project: {
      principalAmount: 1,
      interestRate: 1,
      interestPeriod: 1,
      rotationPeriod: 1,
      giveDate: 1,
      daysPassed: 1,
      numberOfRotations: {
        $cond: [
          {
            $eq: ['$rotationPeriod', '6M'], // Adjust for different rotation periods
          },
          {
            $floor: {
              $divide: ['$daysPassed', 30 * 6], // 6 months
            },
          },
          {
            $cond: [
              {
                $eq: ['$rotationPeriod', '1Y'], // Adjust for different rotation periods
              },
              {
                $floor: {
                  $divide: ['$daysPassed', 365], // 1 year
                },
              },
              0, // Default for other cases
            ],
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
      rotationPeriod: 1,
      numberOfRotations:1,
      giveDate: 1,
      daysPassed: 1,
      interestAccrued: {
        $cond: [
          {
            $eq: ['$interestPeriod', 'W'],
          },
          {
            $multiply: ['$principalAmount', { $divide:['$interestRate',100]}, { $divide: ['$daysPassed', 7] }],
          },
          {
            $cond: [
              {
                $eq: ['$interestPeriod', 'M'],
              },
              {
                $multiply: ['$principalAmount', { $divide:['$interestRate',100]}, { $divide: ['$daysPassed', 30] }],
              },
              {
                $cond: [
                  {
                    $eq: ['$interestPeriod', 'Y'],
                  },
                  {
                    $multiply: ['$principalAmount', { $divide:['$interestRate',100]}, { $divide: ['$daysPassed', 365] }],
                  },
                  0,
                ],
              },
            ],
          },
        ],
      },
      totalAmount: {
        $sum: ['$principalAmount', '$interestAccrued'],
      },
    },
  },

  
]).exec((err, result) => {
  if (err) {
    console.error(err);
    res.send(err)
  } else {
    console.log(result);
    res.send(result);
  }
});
})

*/
module.exports =router;
