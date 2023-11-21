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
    allTransactions.forEach((transaction) => {
      const principalAmount = transaction.principalAmount;
      const interestRate = transaction.interestRate;
      const interestPeriod = transaction.interestPeriod
      const giveDate = transaction.giveDate;
      const compoundPeriod = transaction.rotationPeriod;
      const timeElapsed = Math.floor((Date.now() - giveDate.getTime())/(24*60*60*1000));//Note-02 look for possible optimizations
      const n = Math.floor(timeElapsed/compoundPeriod);
      const d = timeElapsed % compoundPeriod;
        totalAmount =principalAmount * Math.pow(1 + (interestRate*compoundPeriod)/ (100*interestPeriod), n)*(1+(interestRate*d)/(interestPeriod*100));
        console.log(principalAmount,interestRate,n,d ,totalAmount)   
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

function calculaterhelper(giveDate,compoundPeriod){
  const todaydate = Date.now();
  var startDate=giveDate;
  var pendingdays;
  var rotation =0 ;
  var flag=true;
  while(flag){
    startDate.setMonth(startDate.getMonth() + compoundPeriod);
    if(startDate>todaydate){
      startDate.setMonth(startDate.getMonth() - compoundPeriod);
      pendingdays=Math.floor(todaydate/(24*3600000))-(startDate/(24*3600000));
      flag=false;
      break;
    }
    else{rotation++;}
  }
  console.log(startDate,compoundPeriod,giveDate,new Date(todaydate))
  return {rotation,pendingdays};
}

async function calculateTotalAmount2() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});
    // Calculate the total amount
    let totalAmount = 0;
    allTransactions.forEach((transaction) => {
      const principalAmount = transaction.principalAmount;
      const interestRate = transaction.interestRate;
      const interestPeriod = transaction.interestPeriod
      const giveDate = transaction.giveDate;
      const compoundPeriod = transaction.rotationPeriod;
      const n = calculaterhelper(giveDate,Math.floor(compoundPeriod/30));//return n,d
      var f=1;
      if(interestPeriod==365 && compoundPeriod!=365){
        f = compoundPeriod/360;
      }
      else if(interestPeriod!=365 && compoundPeriod==365){
        f = 360/interestPeriod;
      }
      else if (interestPeriod!=365&&compoundPeriod!=365){
        f = compoundPeriod/interestPeriod;
      }
      //const f = compoundPeriod/interestPeriod;
        totalAmount = principalAmount * Math.pow(1 + (interestRate*f)/100, n.rotation)*(1+(interestRate*n.pendingdays)/(interestPeriod*100));
        console.log(principalAmount,interestRate,interestPeriod,compoundPeriod,n.rotation,n.pendingdays ,totalAmount)
      
    });

  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

function calculaterhelper2(amount,testDate,interestRate,interestPeriod,compoundPeriod,testdate,olddata,olddates){
  const todaydate = testdate;
  var startDate=testDate;
  var pendingdays;
  var rotation =0 ;
  var flag=true;
  var datearr=olddates;
  var amountarr=olddata;
  var lastdate;

  var f=1;
      if(interestPeriod==365 && compoundPeriod!=365){
        f = compoundPeriod/360;
      }
      else if(interestPeriod!=365 && compoundPeriod==365){
        f = 360/interestPeriod;
      }
      else if (interestPeriod!=365&&compoundPeriod!=365){
        f = compoundPeriod/interestPeriod;
      }




  while(flag){
    //console.log(startDate)
    startDate.setMonth(startDate.getMonth() + (compoundPeriod/30));
    if(startDate>todaydate){
      lastdate=startDate;
      startDate= startDate.setMonth(startDate.getMonth() - (compoundPeriod/30));

      pendingdays=Math.floor(todaydate/(24*3600000))-(startDate/(24*3600000));
      flag=false;
      break;
    }
    else{
      amount=amount*(1 + (interestRate*f)/100);
      amountarr.push(amount);
      rotation++;
      datearr.push(new Date(startDate));
      //console.log(datearr);
    }
  }
  //console.log(amountarr,datearr);
  //console.log(startDate,compoundPeriod,testDate,new Date(todaydate))
  return {amountarr,datearr,rotation,amount,pendingdays};
}

async function calculateTotalAmount3() {
  try {
    // Get all documents from the Dummy collection
    const allTransactions = await Dummy.find({});
    // Calculate the total amount
    let totalAmount = 0;
    allTransactions.forEach(async(transaction) => {
      //console.log("for this entry ",transaction);
      const principalAmount = transaction.principalAmount;
      const interestRate = transaction.interestRate;
      const interestPeriod = transaction.interestPeriod
      const giveDate = transaction.giveDate;
      const compoundPeriod = transaction.rotationPeriod;
      const olddata = transaction.amountArr;
      const olddates = transaction.dateArr;
      var testdate;
      testdate = Date.now();
      var startamount;
      //testdate = new Date("2022-08-08T00:00:00.000Z");
      var inputDate;
      if (olddates.length === 0) {
          inputDate = new Date(giveDate);
        } else {
          // Find the last date in the olddates array
          inputDate = new Date(Math.max(...olddates));
        }
      if (olddata.length === 0) {
        startamount = principalAmount;  
        } else {
        // Find the last date in the olddates array
         startamount= Math.max(...olddata);
      }
      const n = calculaterhelper2(startamount,inputDate,interestRate,interestPeriod,compoundPeriod,testdate,olddata,olddates);//return n,d
      totalAmount =n.amount *(1+(interestRate*n.pendingdays)/(interestPeriod*100));
      console.log("Final Result ",principalAmount,interestRate,n.rotation,n.pendingdays ,totalAmount);
        transaction.amountArr=n.amountarr;
        transaction.dateArr=n.datearr;
        transaction.pendingDays=n.pendingdays;
        await transaction.save();
    });
  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}

async function deletedata() {
  try {
    const allTransactions = await Dummy.find({});  
    allTransactions.forEach(async(transaction) => {
        transaction.amountArr=[];
        transaction.dateArr=[];
        transaction.pendingDays=0;
        await transaction.save();
    });
  } catch (error) {
    console.error('Error calculating total amount:', error);
  }
}


/*
deletedata();
console.log("Calculation 01");
calculateTotalAmount();
console.log("Calculation 02");
calculateTotalAmount2();
console.log("Calculation 03");
calculateTotalAmount3();
*/
module.exports =router;