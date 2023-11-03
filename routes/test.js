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

async function calculateTotalAmount() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});
    // Calculate the total amount
    let totalAmount = 0;
    //NOte-01
    //apply only on non zero interst rates
    //only for rotational period calculations
    //simple interst seprate as no rotational period for them

    allTransactions.forEach((transaction) => {
      const principalAmount = transaction.principalAmount;
      const interestRate = transaction.interestRate;
      const interestPeriod = transaction.interestPeriod
      const giveDate = transaction.giveDate;
      const compoundPeriod = transaction.rotationPeriod;
      const timeElapsed = (Date.now() - giveDate.getTime())/(24*60*60*1000);//Note-02 look for possible optimizations
      const n = Math.floor(timeElapsed/compoundPeriod);
      const d = timeElapsed % compoundPeriod;;
        //Note-03 
        //n =0 make sure not taking toomcuh time by multiply  which is not needed
        //n=1,precalculation cached.... for calculation or in table....
        //NOte-04 other option store interst rate/100  in original or dummy field
        //or interst rate/interest period
        //issue on defasult use 7,30,365 in interst peiod or rotatin period both

        //NOte-04
        //precalculate A,B to reduce  little calculation
        //keep array or rotated amount to reduce repeat calcualtion and it can also avoid ambiguity in results2 percent vs other
        totalAmount =principalAmount * Math.pow(1 + (interestRate*compoundPeriod)/ (100*interestPeriod), n)*(1+(interestRate*d)/(interestPeriod*100));
        console.log(principalAmount,interestRate,n,d ,totalAmount)
      
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

// Calculate the total amount
//calculateTotalAmount();
//insert dummy data
//aggregate run 
//match
//join these if need
//add of currently implemented NSCWMY....
/*
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
