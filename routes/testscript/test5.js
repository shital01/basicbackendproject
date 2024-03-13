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
  
function generateRandomKhataData(a,b,c,numObjects) {
  const dummyData = [];
  const userName=a;
  const userPhoneNumber=b;
  const userId =c;
  var localId;
  const friendName="samenamefriends"//randomize it later
  const numbers=["1111111111","2222222222","3333333333","4444444444","5555555555"];
  const interestTypes = ['N','CM','CY'];

  for (let i = 0; i < numObjects; i++) {
    const friendPhoneNumber = numbers[Math.floor(Math.random() * numbers.length)]    
    const interestRate = Math.floor(Math.random() * 10); // Random interest rate up to 100
    const interestType = interestTypes[Math.floor(Math.random() * interestTypes.length)]; // Random interest period
    const rotationPeriod = ['3M','6M','1Y'][Math.floor(Math.random() * 3)]; // Random rotation period
    localId=Math.floor(Math.random() * 1000000 );

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
  var localId;
  //const localId=Math.floor(Math.random() * 1000000 ) ;//also randomize


  for (let i = 0; i < numObjects; i++) {//99990000
    const amount = Math.floor(Math.random() * 10000 + 10000); // Random amount up to 99.99 crores
    const transactionDate = Math.floor(Math.random() * (endTimestamp - startTimestamp)) + startTimestamp;
    localId=Math.floor(Math.random() * 1000000 );
    const amountGiveBool = bools[Math.floor(Math.random()*2)];
    const khataId = d[Math.floor(Math.random() * d.length)]; // Random interest period
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
function calculateRotations(transactionDate, rotationPeriod, currentDate) {
    const diffMonths = currentDate.diff(transactionDate, 'months');
    const periods = Math.floor(diffMonths / rotationPeriod);
    console.log("periods",diffMonths,periods)
    const nextRotation = moment(transactionDate).add(periods * rotationPeriod, 'months');
    const remainingDays = currentDate.diff(nextRotation, 'days');

    return { completedPeriods: periods, remainingDays };
}

function calculateRotations1(transactionDate, rotationPeriod, currentDate) {
  if((rotationPeriod==3)||(rotationPeriod==6)||(rotationPeriod==18)){
    const diffDays = currentDate.diff(transactionDate, 'days');
    const periods = Math.floor(diffDays / (30*rotationPeriod));
    console.log("periods",diffDays,periods)
    const remainingDays = diffDays-periods*30*rotationPeriod;
        return { completedPeriods: periods, remainingDays };

  }
  else{
    const diffDays = currentDate.diff(transactionDate, 'days');
    const periods = Math.floor((diffDays*12) / (365*rotationPeriod));
    console.log("periods",diffDays,periods)
    const remainingDays = diffDays-(periods*365*rotationPeriod/12);
        return { completedPeriods: periods, remainingDays };

  }

}

function givePeriod(input){
  if(input=='3M'){return 3}
  else if(input=='6M'){return 6}
  else if(input=='1Y'){return 12}
  else if(input=='18M'){return 18}
  else if(input=='2Y'){return 24}
  if(input=='0M'){return 1;}

}
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
        const transactionDateMoment = moment(transactionDate*1000);
        console.log(currentDate,"*****",transactionDate,transactionDateMoment);
        const t= givePeriod(rotationPeriod);

        const test = calculateRotations(transactionDateMoment,t,currentDate);
        console.log(test)

console.log(interestType,currentDate,transactionDate,transactionDateMoment,test.completedPeriods,test.remainingDays,interestRate,rotationPeriod);
        let interest = 0;
 console.log(transaction);

        switch (interestType) {
          case 'N':
            interest = 0;
            break;
          case 'CM':
            interest = calculateCompoundInterest(amount, interestRate*t,interestRate/30, test.completedPeriods,test.remainingDays);
            break;
          case 'CY':
            interest = calculateCompoundInterest(amount, (interestRate*t)/12, interestRate/365, test.completedPeriods,test.remainingDays);
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



// Assuming you have models defined for User, Khata, and Transaction
router.post('/showcalculations1', auth, async (req, res) => {
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
        const transactionDateMoment = moment(transactionDate*1000);
        console.log(currentDate,"*****",transactionDate,transactionDateMoment);
        const t= givePeriod(rotationPeriod);
        
        const test = calculateRotations1(transactionDateMoment,t,currentDate);
        console.log(test)

console.log(interestType,currentDate,transactionDate,transactionDateMoment,test.completedPeriods,test.remainingDays,interestRate,rotationPeriod);
        let interest = 0;
 console.log(transaction);

        switch (interestType) {
          case 'N':
            interest = 0;
            break;
          case 'CM':
            interest = calculateCompoundInterest(amount, interestRate*t,interestRate/30, test.completedPeriods,test.remainingDays);
            break;
          case 'CY':
            interest = calculateCompoundInterest(amount, (interestRate*t)/12, interestRate/365, test.completedPeriods,test.remainingDays);
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



// Assuming you have models defined for User, Khata, and Transaction
//for khata specific
router.post('/showcalculations3/', auth, async (req, res) => {
  try {
    const  khataId  = req.body.khataId; // Extract khataId from request parameters

    // Find the specific Khata using khataId and user's ID
    const khata = await Khata.findOne({ _id: khataId, userId: req.user._id });

    if (!khata) {
      return res.status(404).json({ error: 'Khata not found for the user' });
    }

    // Find all transactions for the specific Khata
    const transactions = await Transaction.find({ khataId });

    let khataTotal = 0;

    const currentDate = moment(req.body.time)||moment(); // Current date/time
var interestarr=[];
var totalarr=[];
var times=[];
    for (const transaction of transactions) {
      const { amount, transactionDate } = transaction;
      const { interestType, interestRate, rotationPeriod } = khata;
      const transactionDateMoment = moment(transactionDate );//*1000

      // Calculate periods and remaining days
      const t = givePeriod(rotationPeriod);
      const test = calculateRotations1(transactionDateMoment, t, currentDate);

      let interest = 0;

      switch (interestType) {
        case 'N':
          interest = 0;
          break;
        case 'CM':
          interest = calculateCompoundInterest(amount, interestRate * t, interestRate / 30, test.completedPeriods, test.remainingDays);
          break;
        case 'CY':
          interest = calculateCompoundInterest(amount, (interestRate * t) / 12, interestRate / 365, test.completedPeriods, test.remainingDays);
          break;
        default:
          interest = 0;
          break;
      }

      // Calculate total for each transaction
      khataTotal += transaction.amountGiveBool ? -1 * (amount + interest) : amount + interest;

      // Attach interest to each transaction
      transaction.interest = interest;
      interestarr.push(interest);
      totalarr.push(interest+amount);
      times.push(test);
    }

    res.json({ khataId: khata._id, totalAmount: khataTotal, transactions,interestarr,totalarr,times });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

//for khata specific but correctone
router.post('/showcalculations4/', auth, async (req, res) => {
  try {
    const  khataId  = req.body.khataId; // Extract khataId from request parameters

    // Find the specific Khata using khataId and user's ID
    const khata = await Khata.findOne({ _id: khataId, userId: req.user._id });

    if (!khata) {
      return res.status(404).json({ error: 'Khata not found for the user' });
    }

    // Find all transactions for the specific Khata
    const transactions = await Transaction.find({ khataId });

    let khataTotal = 0;

    const currentDate = moment(req.body.time)||moment(); // Current date/time
    console.log(currentDate)
var interestarr=[];
var totalarr=[];
var times=[];
    for (const transaction of transactions) {
      const { amount, transactionDate } = transaction;
      const { interestType, interestRate, rotationPeriod } = khata;
      const transactionDateMoment = moment(transactionDate );//*1000

      // Calculate periods and remaining days
      const t = givePeriod(rotationPeriod);
      const test = calculateRotations(transactionDateMoment, t, currentDate);

      let interest = 0;

      switch (interestType) {
        case 'N':
          interest = 0;
          break;
        case 'CM':
          interest = calculateCompoundInterest(amount, interestRate * t, interestRate / 30, test.completedPeriods, test.remainingDays);
          break;
        case 'CY':
          interest = calculateCompoundInterest(amount, (interestRate * t) / 12, interestRate / 365, test.completedPeriods, test.remainingDays);
          break;
        default:
          interest = 0;
          break;
      }

      // Calculate total for each transaction
      khataTotal += transaction.amountGiveBool ? -1 * (amount + interest) : amount + interest;

      // Attach interest to each transaction
      transaction.interest = interest;
      interestarr.push(interest);
      totalarr.push(interest+amount);
      times.push(test);
    }

    res.json({ khataId: khata._id, totalAmount: khataTotal, transactions,interestarr,totalarr,times });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});





function calculateCompoundInterest(amount, interestRate1,interestRate2, totalRotations, remainingDays) {
  const r1 = interestRate1 /  100;
  const r2 = interestRate2 /  100;

 // const power = totalRotations + remainingDays / (365 * periodMultiplier);
 console.log(">>>>>>>>>");

 console.log(amount,r1,totalRotations,remainingDays,r2);
  const compoundAmount = amount * Math.pow((1 + r1), totalRotations) *(1+(remainingDays*r2));
  return compoundAmount - amount;
}


router.post('/removeduplicate',async(req,res) =>{
  Transaction.aggregate([
  {
    $group: {
      _id: {
        deviceId: "$deviceId",
        localId: "$localId"
      },
      ids: { $addToSet: "$_id" },
      count: { $sum: 1 }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }
], function(err, duplicates) {
  if (err) {
    console.error(err);
    // Handle error
  } else {
    const idsToDelete = duplicates.map(dup => dup.ids.slice(1)).flat();
    Transaction.deleteMany({ _id: { $in: idsToDelete } }, function(err, result) {
      if (err) {
        console.error(err);
        // Handle error
      } else {
        console.log(`${result.deletedCount} duplicate documents deleted.`);
        res.send("success"+`${result.deletedCount} duplicate documents deleted.`)
        // Handle success
      }
    });
  }
});

})

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