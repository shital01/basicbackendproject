const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
const {Khata,validate} = require('../models/khata');
router.post('/',async(req,res)=>{
	const result = validate(req.body);
	
	if(result.error){
		dbDebugger(result.error.details[0].message)
		res.status(400).send(result.error.details[0]);
	}
	else{//IST time
		//req.body.updatedTimeStamp=Date.now();
		const khata = new Khata(req.body);
		const output = await khata.save();
		res.send(output);
		}
});

module.exports =router;