const express = require('express');
//instead of app word router is used
const router = express.Router();
const Joi = require('joi');
const config = require('config');
const {User} = require('../models/user');
const {Transaction} = require('../models/transaction');

const authorization =require('../middleware/authorization');
const dbDebugger = require('debug')('app:db');


//Admin secureity
//Delete Feature
//Viral mostly offline agreagaotr code
//Charting not possible
//event trakcing related not
//Time ot first Transaction average
//Viral Factor
//last x days Users

//show users,transaction
//show counts
//morw than x messages
//more than x friends
//last x days transaction
//last x days users-TODO
//last x days made transactions

router.get('/GetUsers',async(req,res)=>{
	let users = await User.find({},{Name:1,PhoneNumber:1});//for token regeneration hence not one lien do
	res.header().send({error:null,response:users});
});


router.get('/GetTransactions',async(req,res)=>{
	let users = await Transaction.find({},{SenderName:1,ReceiverName:1,Amount:1,Notes:1});//for token regeneration hence not one lien do
	res.header().send({error:null,response:users});
});

router.get('/TotalUsers',async(req,res)=>{
	let users = await User.count();
	res.header().send({error:null,response:users});
});


router.get('/TotalTransactions',async(req,res)=>{
	let users = await Transaction.count();
	res.header().send({error:null,response:users});
});


router.get('/TenPlusCount',async(req,res)=>{

let counts = await Transaction.aggregate([
  {
    $group: {
      _id: "$SenderPhoneNumber",
      transactionCount: { $sum: 1 }
    }
  },
  {
    $match: {
      transactionCount: { $gt: 5 }//10
    }
  },
  {
    $group: {
      _id: null,
      userCount: { $sum: 1 }
    }
  }
])
res.header().send({error:null,response:counts});
});


router.get('/FivePlusCount',async(req,res)=>{

let counts = await Transaction.aggregate([
  {
    $group: {
      _id: "$SenderPhoneNumber",
      uniqueRecipients: { $addToSet: "$ReceiverPhoneNumber" }
    }
  },
  {
    $project: {
      _id: 1,
      uniqueRecipientsCount: { $size: "$uniqueRecipients" }
    }
  },
  {
    $match: {
      uniqueRecipientsCount: { $gte: 5 }//total how many
    }
  },
  {
    $group: {
      _id: null,
      userCount: { $sum: 1 }
    }
  }
])
res.header().send({error:null,response:counts});
});

router.get('/FivPlusCount',async(req,res)=>{

let counts = await Transaction.aggregate([
  {
    $group: {
      _id: "$SenderPhoneNumber",
      uniqueReceivers: { $addToSet: "$ReceiverPhoneNumber" }
    }
  },
  {
    $project: {
      _id: 0,
      SenderPhoneNumber: "$_id",
      numberOfUniqueReceivers: { $size: "$uniqueReceivers" }
    }
  },
  {
    $match: {
      numberOfUniqueReceivers: { $gte: 5 }//count
    }
  },
  {
    $group: {
      _id: null,
      numberOfUsers: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      numberOfUsers: 1
    }
  }
])
res.header().send({error:null,response:counts});
});

//last day,last week,last month transactions
//Count 1,7,30

router.get('/LastTransactionCount',async(req,res)=>{
const days = req.body.Count
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - days);

let counts = await Transaction.aggregate([
  {
    $match: {
      UpdatedDate: { $gte: oneWeekAgo }
    }
  },
  {
    $group: {
      _id: null,
      totalTransactions: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      totalTransactions: 1
    }
  }
])
res.header().send({error:null,response:counts});
});
//


router.get('/LastUserCount',async(req,res)=>{
const days = req.body.Count

const today = new Date();
const xxxDaysAgo = new Date(today);
xxxDaysAgo.setDate(xxxDaysAgo.getDate() - days);

let counts = await User.aggregate([
  {
    $match: {
      _id: { $gte: xxxDaysAgo} 
    }
  },
  {
    $group: {
      _id: null,
      totalTransactions: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      totalTransactions: 1
    }
  }
])


res.header().send({error:null,response:counts});
});

//Dummy Active USer
router.get('/LastActiveCount',async(req,res)=>{
const days = req.body.Count

const today = new Date();
const eightDaysAgo = new Date(today);
eightDaysAgo.setDate(eightDaysAgo.getDate() - days);

let counts = await Transaction.aggregate([
  {
    $match: {
      UpdatedDate: { $gte: eightDaysAgo }
    }
  },
  {
    $group: {
      _id: "$SenderPhoneNumber"
    }
  },
  {
    $group: {
      _id: null,
      numberOfUniqueSenders: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      numberOfUniqueSenders: 1
    }
  }
])
res.header().send({error:null,response:counts});
});
module.exports =router;