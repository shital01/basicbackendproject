const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
//const {Dummy} = require('../models/dummy');
const {User} = require('../../models/user');

const {Khata} = require('../../models/khata');
const {Transaction} = require('../../models/transaction');
const auth = require('../../middleware/auth');

//const moment = require('moment');
//bunch of userId, dummy user make
//gene bunch of khata Ids
//bunch of transactions
//radom put for delte this that seen api calls
/*
cuurently use one user and fetch user id,pheon name default
and rest from arrya of khaat ids n rest in random
*/
  
//Sample user and same data only 7 different examples
//then randpmo user,random khata ,random transction with limits genereae and test
//Remove unnnesory data types 
//or modifey data types if needed
 /* 
function generateRandomKhataData(a,b,c,numObjects) {
  const dummyData = [];
  const userName=a;
  const userPhoneNumber=b;
  const userId =c;
  const localId="1";
  const friendName="samenamefriends"//randomize it later
  const numbers=["1111111111","2222222222","3333333333","4444444444","5555555555"];
  const interestTypes = ['N','CM','CY'];

  for (let i = 0; i < numObjects; i++) {
    const friendPhoneNumber = numbers[Math.floor(Math.random() * numbers.length)]    
    const interestRate = Math.floor(Math.random() * 100); // Random interest rate up to 100
    const interestType = interestTypes[Math.floor(Math.random() * interestTypes.length)]; // Random interest period
    const rotationPeriod = ['3M','6M','1Y'][Math.floor(Math.random() * 3)]; // Random rotation period
    

    dummyData.push({
      userName,
      userPhoneNumber,
      userId,
      friendName,
      friendPhoneNumber,
      interestType,
      interestRate,
      rotationPeriod,
      localId
    });
  }

  return dummyData;
}


function generateRandomTransactionData(a,b,c,d,numObjects) {
  const dummyData = [];
  const startTimestamp = 1609545600000; // Start timestamp
  const endTimestamp = Date.now(); // Current timestamp or your desired end date
  const bools = [true,false];
  const userName=a;
  const userPhoneNumber=b;
  const userId =c;
  const localId="1";


  for (let i = 0; i < numObjects; i++) {
    const amount = Math.floor(Math.random() * 99990000 + 10000); // Random amount up to 99.99 crores
    const transactionDate = Math.floor(Math.random() * (endTimestamp - startTimestamp)) + startTimestamp;
    
    const amountGiveBool = bools[Math.floor(Math.random()*2)];
    const khataId = d[Math.floor(Math.random() * d.length)]; // Random interest period
    /*
    const interestRate = Math.floor(Math.random() * 100); // Random interest rate up to 100
    const interestPeriod = interestPeriods[Math.floor(Math.random() * interestPeriods.length)]; // Random interest period
    const rotationPeriod = [90, 180, 365][Math.floor(Math.random() * 3)]; // Random rotation period
    */
/*
    dummyData.push({
      userName,
      userPhoneNumber,
      userId,
      amount,
      transactionDate,
      amountGiveBool,
      khataId,
      localId
    });
  }

  return dummyData;
}

let generatedKhataData;// = generateRandomKhataData(10); // Generate 20 random objects
let generatedTransactionData;// = generateRandomTransactionData(100); // Generate 20 random objects

//console.log(generatedData);

async function dummyKhataDump(){
    const result = await Khata.insertMany(generatedKhataData,{ ordered: false } );
    console.log(result)
    return result
}
async function getKhataIds(id){
  console.log(id);
    const result = await Khata.find({"userId":id}).select("_id");
    return result;
}
async function dummyTransactionDump(){
    const result = await Transaction.insertMany(generatedTransactionData,{ ordered: false } );
    console.log(result)
}

router.post('/genKhata',auth, async (req, res) => {
   generatedKhataData = generateRandomKhataData(req.user.name,req.user.phoneNumber,req.user._id,10); // Generate 20 random objects
     console.log(">>>>");
  console.log(generatedKhataData)
   const result = await dummyKhataDump();
   res.send(result)
});
router.post('/genTransaction',auth, async (req, res) => {
  let Ids = await getKhataIds(req.user._id);//later user based not single user
  console.log(Ids);
  generatedTransactionData = generateRandomTransactionData(req.user.name,req.user.phoneNumber,req.user._id,Ids,100); // Generate 20 random objects

  const results = await dummyTransactionDump();
  res.send(results)
});




// Assuming you have models for User, Khata, and Transaction
const moment = require('moment'); // Use a date library like Moment.js for date calculations


// Assuming you have models defined for User, Khata, and Transaction
router.post('/showcalculations', auth, async (req, res) => {
  try {
    const khatas = await Khata.find({ userId: req.user._id });

    const khataTotals = [];

    for (const khata of khatas) {
      const transactions = await Transaction.find({ khataId: khata._id });

      let khataTotal = 0;

      const currentDate = moment(); // Current date/time

      for (const transaction of transactions) {
        const { amount, transactionDate } = transaction;
        const { interestType, interestRate, rotationPeriod } = khata;

        const transactionDateMoment = moment(transactionDate);
        const diffMonths = currentDate.diff(transactionDateMoment, 'months');
        const remainingDays = currentDate.diff(transactionDateMoment, 'days');
console.log(currentDate,transactionDate,transactionDateMoment,diffMonths,remainingDays);
        let interest = 0;

        switch (interestType) {
          case 'N':
            interest = 0;
            break;
          case 'CM':
            interest = calculateCompoundInterest(amount, interestRate, rotationPeriod, diffMonths, remainingDays, 12);
            break;
          case 'CY':
            interest = calculateCompoundInterest(amount, interestRate, rotationPeriod, diffMonths, remainingDays, 1);
            break;
          default:
            interest = 0;
            break;
        }

        khataTotal += transaction.amountGiveBool ? -1 * (amount + interest) : amount + interest;
      }

      khataTotals.push({ khataId: khata._id, totalAmount: khataTotal });
    }

    res.json({ khataTotals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});


function calculateCompoundInterest(amount, interestRate, rotationPeriod, totalRotations, remainingDays, periodMultiplier) {
  const monthlyInterestRate = interestRate / (periodMultiplier * 100);
  const power = totalRotations + remainingDays / (365 * periodMultiplier);
  const compoundAmount = amount * Math.pow((1 + monthlyInterestRate), totalRotations) *(1+);
  return compoundAmount - amount;
}




router.post('/multiple', async (req, res) => {
     const result = await Dummy.insertMany(req.body,{ ordered: false } );
});
/***************************************************Modified*******************************/

router.post('/showcalculations2',auth, async (req, res) => {
//Code here

//Apply query here user or khatas
const allTransactions = await Transaction.find({});
    // Calculate the total amount
    let totalAmount = 0;
    allTransactions.forEach((transaction) => {
      const { amount, interestRate, interestPeriod, transactionDate, rotationPeriod } = transaction;
      const n = calculaterhelper(transactionDate,Math.floor(rotationPeriod/30));//return n,d
      var f=1;
      if(interestPeriod==365 && rotationPeriod!=365){
        f = rotationPeriod/360;
      }
      else if(interestPeriod!=365 && rotationPeriod==365){
        f = 360/interestPeriod;
      }
      else if (interestPeriod!=365&&rotationPeriod!=365){
        f = rotationPeriod/interestPeriod;
      }
      //const f = rotationPeriod/interestPeriod;
        totalAmount = amount * Math.pow(1 + (interestRate*f)/100, n.rotation)*(1+(interestRate*n.pendingdays)/(interestPeriod*100));
        console.log(amount,interestRate,interestPeriod,rotationPeriod,n.rotation,n.pendingdays ,totalAmount)  
    });

  generatedTransactionData = generateRandomTransactionData(req.user.userName,req.user.userPhoneNumber,req.user._id,Ids,100); // Generate 20 random objects
  await dummyKhataDump();
});

function calculaterhelper(transactionDate,rotationPeriod){
  const todaydate = Date.now();
  var startDate=transactionDate;
  var pendingdays;
  var rotation =0 ;
  var flag=true;
  while(flag){
    startDate.setMonth(startDate.getMonth() + rotationPeriod);
    if(startDate>todaydate){
      startDate.setMonth(startDate.getMonth() - rotationPeriod);
      pendingdays=Math.floor(todaydate/(24*3600000))-(startDate/(24*3600000));
      flag=false;
      break;
    }
    else{rotation++;}
  }
  console.log(startDate,rotationPeriod,transactionDate,new Date(todaydate))
  return {rotation,pendingdays};
}

async function calculateTotalAmountwithAdjustedMonthAndYear() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});
    // Calculate the total amount
    let totalAmount = 0;
    allTransactions.forEach((transaction) => {
      const { amount, interestRate, interestPeriod, transactionDate, rotationPeriod } = transaction;
      const n = calculaterhelper(transactionDate,Math.floor(rotationPeriod/30));//return n,d
      var f=1;
      if(interestPeriod==365 && rotationPeriod!=365){
        f = rotationPeriod/360;
      }
      else if(interestPeriod!=365 && rotationPeriod==365){
        f = 360/interestPeriod;
      }
      else if (interestPeriod!=365&&rotationPeriod!=365){
        f = rotationPeriod/interestPeriod;
      }
      //const f = rotationPeriod/interestPeriod;
        totalAmount = amount * Math.pow(1 + (interestRate*f)/100, n.rotation)*(1+(interestRate*n.pendingdays)/(interestPeriod*100));
        console.log(amount,interestRate,interestPeriod,rotationPeriod,n.rotation,n.pendingdays ,totalAmount)  
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}
//dummyDump();
//console.log("Calculation 01");
//calculateTotalAmountwithAdjustedMonthAndYear();

module.exports =router;