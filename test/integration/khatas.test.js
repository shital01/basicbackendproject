const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Khata } = require('../../models/khata');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');

let server;

let k1, k2;
const userid = mongoose.Types.ObjectId();
const userid2 = mongoose.Types.ObjectId();

const khata1id = mongoose.Types.ObjectId();
const khata2id = mongoose.Types.ObjectId();

const khata1 = {
	_id: khata1id,
	userName: 'name1',
	friendName: 'f1',
	userPhoneNumber: '1313131212',
	friendPhoneNumber: '1313131210',
	interestType: 'N',
	localId: '1',
	userId: userid,
	rotationPeriod: '3M',
	updatedTimeStamp: 1211231231231,
	deviceId: '123',
};
const khata2 = {
	_id: khata2id,
	userName: 'name1',
	friendName: 'f1',
	userPhoneNumber: '1313131213',
	friendPhoneNumber: '1313131212',
	interestType: 'N',
	localId: '2',
	userId: userid,
	rotationPeriod: '3M',
	updatedTimeStamp: 1211231231231,
	deviceId: '234',
};

describe('/api/khatas', () => {
	beforeEach(() => {
		server = require('../../index');
	});
	afterEach(async () => {
		await server.close();
		await User.deleteMany({});
		await Khata.deleteMany({});
	});
	//To Match property fail sometime n too strict  so to have property then array containing
	//To Match(too strict fail due to location),to have property,loop over all objects with all fields have and length field
	//to be truthy to check even value of object field
	/*
expect(Object.keys(res.body)).toEqual(
  expect.arrayContaining(['SenderName','SenderPhoneNumber']))
  //expect(res.body.some(t =>t.SenderName ==='name1')).toBeTruthy();
  //expect(res.body.some(t =>t.SenderName ==='name2')).toBeTruthy();
*/

	//test each input failrue so increase in no of path and also loop over input if possible
	//set recievrname null undefine nlal in loop to test
	//Get Request Paths Testing
	describe('GET /', () => {
		//getData() transaction1,...4
		//Happy Path
		var token;
		var payload = {};
		var deviceId = '456';
		let exec = (payload) => {
			return request(server)
				.get('/api/khatas/')
				.set('x-auth-token', token)
				.set('deviceId', deviceId) //if 123 the less result
				.query(payload);
		};
		beforeEach(() => {
			token = new User({
				_id: userid,
				phoneNumber: '1313131212',
				name: 'name1',
			}).generateAuthToken();
		});
		it('should return 401 for No token', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
		});
		it('should return 400 for invalid token', async () => {
			token = '1';
			const res = await exec();
			expect(res.status).toBe(400);
		});
		//handle all type of dates too not a dat etype,not a valid date,too early or too late
		it('should return 400 for invalid Date', async () => {
			lastUpdatedTimeStamp = null;
			payload = { lastUpdatedTimeStamp };
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});
		it('should return 400 for invalid pageSize', async () => {
			const invalidPageSizes = [-3, 0, '12'];
			for (const pageSize of invalidPageSizes) {
				const payload = { pageSize };
				const res = await exec(token, payload);
				expect(res.status).toBe(400);
			}
		});
		it('should return 400 for invalid pageNumber', async () => {
			const invalidPageNumbers = [-3, 0, '12'];
			for (const pageNumber of invalidPageNumbers) {
				const payload = { pageNumber };
				const res = await exec(token, payload);
				expect(res.status).toBe(400);
			}
		});
		//in success path also for max 10000 check ....
		it('should return all khatas with Date', async () => {
			const khatas = await Khata.collection.insertMany([khata1, khata2]);
			//  console.log(token);
			const k2 = await Khata.find({});
			console.log(k2);
			//console.log(khatas);
			//const k2= await Transaction.find({})
			//console.log(k2)
			payload = { lastUpdatedTimeStamp: 1211231231230 };
			const res = await exec(payload);
			expect(res.status).toBe(200);
			console.log(res.body);
			console.log(res.body);

			expect(res.body.newEntries.length).toBe(2);
			expect(Object.keys(res.body.newEntries[0])).toEqual(
				expect.arrayContaining([
					'settledFlag',
					'friendName',
					'_id',
					'friendPhoneNumber',
					'userPhoneNumber',
					'userId',
					'interestRate',
					'localId',
					'interestType',
					'rotationPeriod',
					'updatedTimeStamp',
				]),
			);
		});
		/*
	it('should return all khatas with Date and pageNumber',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  payload = {lastUpdatedTimeStamp:1211231231230,pageNumber:1}
	  const res = await exec(payload);
	  expect(res.status).toBe(200);
	  console.log(res.body);
	  console.log(res.body.results[0]);

	  expect(res.body.results.length).toBe(1);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
		});

	it('should return all khatas with Date and PageSize',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  payload = {lastUpdatedTimeStamp:1211231231230,pageSize:2}
	  const res = await exec(payload);
	  expect(res.status).toBe(200);
	  console.log(res.body);
	  console.log(res.body.results[0]);

	  expect(res.body.results.length).toBe(1);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
		});

	it('should return all khatas with Date and page size and pageNumber',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  payload = {lastUpdatedTimeStamp:1211231231230,pageSize:1,pageNumber:1}
	  const res = await exec(payload);
	  expect(res.status).toBe(200);
	  expect(res.body.results.length).toBe(1);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
		});
		*/
		it('should return all khatas without Date', async () => {
			const khatas = await Khata.collection.insertMany([khata1, khata2]);
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.newEntries.length).toBe(2);
			expect(Object.keys(res.body.newEntries[0])).toEqual(
				expect.arrayContaining([
					'settledFlag',
					'friendName',
					'_id',
					'friendPhoneNumber',
					'userPhoneNumber',
					'userId',
					'interestRate',
					'localId',
					'interestType',
					'rotationPeriod',
					'updatedTimeStamp',
				]),
			);
		});
		it('should return none khatas due to Advance Date', async () => {
			const khatas = await Khata.collection.insertMany([khata1, khata2]);
			payload = { lastUpdatedTimeStamp: 1211231231232 };

			const res = await exec(payload);
			expect(res.status).toBe(200);
			expect(res.body.newEntries.length).toBe(0);
			// expect(Object.keys(res.body[0])).toEqual(
			//expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
		});
		it('should return not one less khatas due to deviceId due to get all', async () => {
			const khatas = await Khata.collection.insertMany([khata1, khata2]);
			deviceId = '123';
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.newEntries.length).toBe(2);
			expect(Object.keys(res.body.newEntries[0])).toEqual(
				expect.arrayContaining([
					'settledFlag',
					'friendName',
					'_id',
					'friendPhoneNumber',
					'userPhoneNumber',
					'userId',
					'interestRate',
					'localId',
					'interestType',
					'rotationPeriod',
					'updatedTimeStamp',
				]),
			);
		});
		it('should return one less khatas due to deviceId ', async () => {
			const khatas = await Khata.collection.insertMany([khata1, khata2]);
			deviceId = '123';
			payload = { lastUpdatedTimeStamp: 1211231231230 };
			const res = await exec(payload);
			expect(res.status).toBe(200);
			expect(res.body.newEntries.length).toBe(1);
			expect(Object.keys(res.body.newEntries[0])).toEqual(
				expect.arrayContaining([
					'settledFlag',
					'friendName',
					'_id',
					'friendPhoneNumber',
					'userPhoneNumber',
					'userId',
					'interestRate',
					'localId',
					'interestType',
					'rotationPeriod',
					'updatedTimeStamp',
				]),
			);
		});
		/*
	it('should return all khatas without Date and pagesize',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  const res = await exec({pageSize:1});
	  expect(res.status).toBe(200);
	  expect(res.body.results.length).toBe(1);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
	  
	  });
	it('should return all khatas without Date and page number',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
	  const res = await exec({pageNumber:1});
	  expect(res.status).toBe(200);
	  expect(res.body.results.length).toBe(2);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['settledFlag','friendName','_id','friendPhoneNumber','userPhoneNumber','userId','interestRate','localId','interestType','rotationPeriod','updatedTimeStamp']))
	  });
	it('should return all khatas without Date and page size and pagenumber',async() =>{
	  
	  const khatas = await Khata.collection.insertMany([khata1,khata2])
	  const res = await exec({pageNumber:1,pageSize:1});
	  expect(res.status).toBe(200);
	  expect(res.body.results.length).toBe(1);
	  expect(Object.keys(res.body.results[0])).toEqual(
		expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))        
	  
	  });
	  */
	});
	/*********POST************/
	//Get Request Paths Testing
	//date tested in postman working but not in supertest nor date related query picking it up
	//Coverage for cover and path not taken good idea
	describe('POST/', () => {
		let token, userid;
		let transactionDate;
		const exec = () => {
			return request(server)
				.post('/api/khatas/multiple')
				.set('x-auth-token', token)
				.set('deviceId', '123')
				.send([k1, k2]);
		};
		beforeEach(async () => {
			userid = mongoose.Types.ObjectId();
			token = new User({
				_id: userid,
				phoneNumber: '1313131212',
				name: 'name1',
			}).generateAuthToken();
			await User({
				name: 'notifyuser',
				phoneNumber: '1313131210',
				fcmToken: '1',
			}).save();

			//intialize here so one overwrite does do wrong
			k1 = Object.assign({}, khata1); // Create a copy of transaction1 to k1
			k2 = Object.assign({}, khata2);
			delete k1.deviceId;
			delete k2.deviceId;
			delete k1.userId;
			delete k2.userId;
			delete k1._id;
			delete k2._id;
			delete k1.updatedTimeStamp;
			delete k2.updatedTimeStamp;
			delete k1.userName;
			delete k2.userName;
			delete k1.userPhoneNumber;
			delete k2.userPhoneNumber;
		});
		afterEach(async () => {
			await User.deleteMany({});
			await Khata.deleteMany({});
		});
		//Path-01
		it('should return 401 if not logged in', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
		});
		//Path-02
		it('should return 400 if invalid token ', async () => {
			token = '123';
			const res = await exec();
			expect(res.status).toBe(400);
		});
		//now even if all fail wont get 400 due to muliptle instead unsaved and erorr response check
		//also o how many saved vs how many not first this than other as unsaved and error part
		//Path-03
		it('should return 400 if validation khata failed due to friendName', async () => {
			k1.friendName = 1; //make it array
			console.log(k1, k2);
			const res = await exec();
			//console.log("**************************")
			console.log(res.body);
			//console.log("**************************")
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe(
				'"friendName" must be a string',
			);

			//strict field checkor error check
		});
		//Path-04
		it('should return 400 if validation khata failed due to interestRate', async () => {
			k1.interestRate = 120;
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toContain('interestRate');
		});
		//Path-05
		it('should return 400 if validation khata failed due to interestType ', async () => {
			k1.interestType = '1';
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			console.log(res.body.unsavedEntries);
			expect(res.body.unsavedEntries[0].error).toContain('interestType');
		});
		//Path-06
		it('should return 400 if validation khata failed due to rotationPeriod', async () => {
			k1.rotationPeriod = '1M';
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toContain(
				'rotationPeriod',
			);
		});
		//Path-07
		it('should return 400 if validation khata failed due to settledFlag', async () => {
			k1.settledFlag = 1;
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toContain('settledFlag');
		});
		//Path-07
		it('should return 400 if validation khata failed due to localId', async () => {
			k1.localId = null;
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe(
				'"localId" must be a string',
			);
		});
		//Path-08
		//NEED to somehow create this error
		/*
	it('should return 200 if  transaction khata failed due to mongodb issues',async()=>{
	  //k1.localId = null;
	  const res = await exec();
	  expect(res.status).toBe(200);
	  expect(res.body.savedEntries.length).toBe(1);
	  expect(res.body.unsavedEntries.length).toBe(1);
	  expect(res.body.unsavedEntries[0].error).toBe('"localId" must be a string');
	})
	*/
		//handle optinal field too,succesful bare miniumum thenoptional too
		//Path-08
		it('should save and return khatas if valid khata with no input parameter ', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			//check the save part also
			//const transaction = await Transaction.find({SenderName:"name1"});
			//expect(Object.keys(res.body)).toEqual(
			//  expect.arrayContaining(['SenderName','SenderPhoneNumber','ReceiverName','ReceiverPhoneNumber','Isloan','Amount']))
			// Assuming res.body contains the response from your API
			const transactions = res.body.savedEntries;

			// Check if the response contains an array of transactions
			expect(Array.isArray(transactions)).toBe(true);
			expect(transactions).toHaveLength(2); // Adjust based on your expected length

			// Validate properties for each transaction
			expect(Object.keys(transactions[0])).toEqual(
				expect.arrayContaining([
					'settledFlag',
					'_id',
					'friendName',
					'friendPhoneNumber',
					'userId',
					'userName',
					'localId',
					'userPhoneNumber',
					'updatedTimeStamp',
					'interestRate',
					'interestType',
					'rotationPeriod',
				]),
			);
		});
	});

	/*************PUT*********/

	describe('PUT /settle', () => {
		let token, token2;
		let khataId, khataIds;
		let payload = {
			khataIds: ['123']
		}
		//async await remove as direct return
		const exec = (payload) => {
			return request(server)
				.put('/api/khatas/settle')
				.set('x-auth-token', token)
				.set('deviceId', '123')
				.send(payload);
		};
		beforeEach(async () => {
			await User({
				name: 'notifyuser',
				phoneNumber: '1313131210',
				fcmToken: '1',
			}).save();
			await User({
				name: 'notifyuser2',
				phoneNumber: '1313131212',
				fcmToken: '2',
			}).save();
			const khata = await new Khata(khata1).save();
			token = new User({
				_id: userid,
				phoneNumber: '1313131212',
				name: 'name1',
			}).generateAuthToken();
			token2 = new User({
				_id: userid2,
				phoneNumber: '1313131210',
				name: 'name2',
			}).generateAuthToken();
			khataId = khata._id;
			khataIds = [khataId];
			payload = { khataIds };
		});
		afterEach(async () => {
			await User.deleteMany({});
			// await Khata.deleteMany({})
		});
		//Path-01
		it('should return 401 if not logged in', async () => {
			token = '';
			const res = await exec(payload);
			expect(res.status).toBe(401);
		});
		//Path-02
		it('should return 400 if invalid token ', async () => {
			token = '123';
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});

		//Path-04
		it('should return 400 if validation khata failed due to innvalid input type', async () => {
			payload = { khataId };
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});
		//Path-05
		it('should return 400 if validation khata failed due to invalid array type', async () => {
			payload = { khataIds: [1] };
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});

		//Add cAse if local Id is also added in validation function

		//Path-09
		it('should return 404  if khata not found with given ID/if Already delete ', async () => {
			khataId = userid;
			payload = {
				khataObjects: [{
					id: khataId,
					interest: 10
				}]
			};
			const res = await exec(payload);
			expect(res.status).toBe(404);
		});
		//Path-10//hold this test case due to condition of seen not jsut delete feature

		/*it('should return 403  if user forbidden to do this ',async()=>{
	  token=token2;
	  payload={khataIds:[khata1id]}
	  const res = await exec();
	  //expect(res.status).toBe(403);
	  expect(res.status).toBe(403);
	})
	*/
		//Path-11
		/*
	it('should delete khata if valid khata ',async()=>{
	  payload={deleteFlag:true,khataId}
	  const res = await exec(payload);
	  expect(res.status).toBe(200);
	})
	*/
		//Path-12
		it('should update the khata and return valid response if valid khata ', async () => {
			payload = {
				khataObjects: [{
					id: khataId,
					interest: 10
				}]
			};
			const res = await exec(payload);
			expect(res.status).toBe(200);
			const transactions = await Khata.find();
			expect(transactions[0].settledFlag).toBe(true);
		});
		it('should update the khata and return valid response if valid khata but from other user', async () => {
			token = token2;
			payload = {
				khataObjects: [{
					id: khataId,
					interest: 10
				}]
			};
			const res = await exec(payload);
			expect(res.status).toBe(200);
			const transactions = await Khata.find();
			expect(transactions[0].settledFlag).toBe(true);
		});
	});
	/*************PUT*********/

	describe('PUT/ unsettle', () => {
		let token, token2;
		let khataId, khataIds;
		//async await remove as direct return
		const exec = () => {
			return request(server)
				.put('/api/khatas/unsettle')
				.set('x-auth-token', token)
				.set('deviceId', '123')
				.send(payload);
		};
		beforeEach(async () => {
			const khata = await new Khata(khata1).save();
			token = new User({
				_id: userid,
				phoneNumber: '1231231231',
				name: 'name1',
			}).generateAuthToken();
			token2 = new User({
				_id: userid2,
				phoneNumber: '1231231230',
				name: 'name2',
			}).generateAuthToken();
			khataId = khata._id;
			khataIds = [khataId];
			payload = { khataIds };
		});

		//Path-01
		it('should return 401 if not logged in', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
		});
		//Path-02
		it('should return 400 if invalid token ', async () => {
			token = '123';
			const res = await exec();
			expect(res.status).toBe(400);
		});

		//Path-04
		it('should return 400 if validation khata failed due to innvalid input type', async () => {
			payload = { khataId };
			const res = await exec();
			expect(res.status).toBe(400);
		});
		//Path-05
		it('should return 400 if validation khata failed due to invalid array type', async () => {
			payload = { khataIds: [1] };
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});

		//Path-09
		it('should return 404  if khata not found with given ID/if Already delete ', async () => {
			khataId = userid;
			payload = { khataIds: [khataId] };
			const res = await exec();
			expect(res.status).toBe(404);
		});
		//Path-10//hold this test case due to condition of seen not jsut delete feature
		/*
	it('should return 403  if user forbidden to do this ',async()=>{
	  token=token2;
	  payload={khataIds:[khata1id]}
	  const res = await exec();
	  //expect(res.status).toBe(403);
	  expect(res.status).toBe(403);
	})
	*/
		//Path-11
		/*
	it('should delete khata if valid khata ',async()=>{
	  payload={deleteFlag:true,khataId}
	  const res = await exec(payload);
	  expect(res.status).toBe(200);
	})
	*/
		//Path-12
		it('should update the khata and return valid response if valid khata ', async () => {
			const res = await exec(khataIds);
			expect(res.status).toBe(200);
			const transactions = await Khata.find();
			expect(transactions[0].settledFlag).toBe(false);
		});
	});
});
