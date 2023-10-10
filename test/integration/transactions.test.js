const request = require('supertest');
const mongoose = require('mongoose');

const {Transaction} = require('../../models/transaction');
const {User} = require('../../models/user');

let server;
describe('/api/transactions',()=>{

	beforeEach(()=>{server = require('../../index')})
	afterEach(async()=>{
		await server.close();
		await Transaction.deleteMany({});
		await User.deleteMany({})
		});
//To Match property fail sometime n too strict  so to have property then array containing
//To Match(too strict fail due to location),to have property,loop over all objects with all fields have and length field
//to be truthy to check even value of object field
/*
expect(Object.keys(res.body)).toEqual(
	expect.arrayContaining(['userName','userPhoneNumber']))
	//expect(res.body.some(t =>t.userName ==='name1')).toBeTruthy();
	//expect(res.body.some(t =>t.userName ==='name2')).toBeTruthy();
*/

//test each input failure so increase in no of path and also loop over input if possible
//set receivrname null undefine nlal in loop to test
//Get Request Paths Testing	
	describe('GET /',() =>{
			const userid = mongoose.Types.ObjectId();
			const userid2 = mongoose.Types.ObjectId();
			const transaction1 = {
				friendName : "name2",
				amount : 1,
				friendPhoneNumber : "1234512345",
				userName:'name1',
				interestRate:12,
				interestType:'CM',
				userId:userid,
				userPhoneNumber:"1231231231",				
				updatedTimeStamp:"2023-01-01T07:44:31.118Z",
				transactionDate: "2023-02-02T00:00:00.000Z",
				description:"just a note"
			}
			const transaction2 = {
				friendName : "name1",
				amount : -1,
				friendPhoneNumber : "1231231231",
				userName:'name2',
				interestRate:24,
				interestType:'CY',
				userId:userid2,
				userPhoneNumber:"1234512345",
				transactionDate: "2023-01-01T00:00:00.000Z",
				updatedTimeStamp:"2023-01-01T06:44:31.118Z",
				attachmentsPath:["firsturl","secondurl"]
			}
			const transaction3 = {
				friendName : "name1",
				amount : 1,
				friendPhoneNumber : "1431231231",
				userName:'name2',
				interestRate:12,
				interestType:'CW',
				userId:userid2,
				userPhoneNumber:"1434512345",
				updatedTimeStamp:"2023-01-01T09:44:31.118Z",
				transactionDate: "2023-01-12T00:00:00.000Z"

			}
			const transaction4 = {
				friendName : "name1",
				amount : 1,
				interestRate:12,
				interestType:'S',
				friendPhoneNumber : "1231231231",
				userName:'name2',
				userId:userid2,
				userPhoneNumber:"1234512345",
				updatedTimeStamp:"2023-01-01T11:44:31.118Z",
				transactionDate: "2023-01-02T00:00:00.000Z"
			}
			
			//Happy Path
			let exec = () => {
			return  request(server)
			.get('/api/transactions/')
			.set('x-auth-token',token)
			}
			beforeEach(()=>{
			token = new User({_id:userid,phoneNumber:"1234512345",name:"name1"}).generateAuthToken();		
			})
			//Path-01
		it('should return 401 for No token',async() =>{
			token ='';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');
		});
		//Path-02
		it('should return 400 for invalid token',async() =>{
			token ='1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');
		});
		//Path-03
		it('should return all transactions',async() =>{
			await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(res.body.length).toBe(3);
			expect(Object.keys(res.body[0])).toEqual(
				expect.arrayContaining(['userName','userPhoneNumber','userId','friendName','friendPhoneNumber','amount','updatedTimeStamp','interestRate','interestType','transactionDate','_id',]))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
			
		});
	});
	//Get Request Paths Testing	
	//date tested in postman working but not in supertest nor date related query picking it up
	describe('GET BY DATE/',() =>{
			const userid = mongoose.Types.ObjectId();
			const userid2 = mongoose.Types.ObjectId();
			let lastupdatedTimeStamp,token;
			const transaction1 = {
				friendName : "name2",
				amount : 1,
				friendPhoneNumber : "1234512345",
				userName:'name1',
				interestRate:12,
				interestType:'CM',
				userId:userid,
				userPhoneNumber:"1231231231",				
				updatedTimeStamp:"2023-01-01T07:44:31.118Z",
				transactionDate: "2023-02-02T00:00:00.000Z",
				description:"just a note"
			}
			const transaction2 = {
				friendName : "name1",
				amount : -1,
				friendPhoneNumber : "1231231231",
				userName:'name2',
				interestRate:24,
				interestType:'CY',
				userId:userid2,
				userPhoneNumber:"1234512345",
				transactionDate: "2023-01-01T00:00:00.000Z",
				updatedTimeStamp:"2023-01-01T06:44:31.118Z",
				attachmentsPath:["firsturl","secondurl"]
			}
			const transaction3 = {
				friendName : "name1",
				amount : 1,
				friendPhoneNumber : "1431231231",
				userName:'name2',
				interestRate:12,
				interestType:'CW',
				userId:userid2,
				userPhoneNumber:"1434512345",
				updatedTimeStamp:"2023-01-01T09:44:31.118Z",
				transactionDate: "2023-01-12T00:00:00.000Z"

			}
			const transaction4 = {
				friendName : "name1",
				amount : 1,
				interestRate:12,
				interestType:'S',
				friendPhoneNumber : "1231231231",
				userName:'name2',
				userId:userid2,
				userPhoneNumber:"1234512345",
				updatedTimeStamp:"2023-01-01T11:44:31.118Z",
				transactionDate: "2023-01-02T00:00:00.000Z"
			}
			
			
			//Happy Path
			let exec = () => {
			return  request(server)
			.put('/api/transactions/fetchtransactions')
			.set('x-auth-token',token)
			.send({lastUpdatedTimeStamp})
			}
			beforeEach(async()=>{
			const user = new User({phoneNumber:"1234512345",name:"name1"})		
			await user.save();
			token = user.generateAuthToken();
			lastUpdatedTimeStamp=new Date("2020-01-02T06:44:31.118Z").toISOString();
			})
			afterEach(async()=>{
			await User.deleteMany({})
			})
			//Path-01
		it('should return 401 for No token',async() =>{
			token ='';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');
		});
		//Path-02
		it('should return 400 for invalid token',async() =>{
			token ='1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');
		});
		//Path-03
		it('should return 400 for invalid Date',async() =>{
			lastUpdatedTimeStamp =null;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"lastUpdatedTimeStamp" must be a valid date');
		});
		//it wont be running due to date
		//Path-04
		
		it('should return all transactions',async() =>{
			await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			//lastupdatedTimeStamp = new Date(lastupdatedTimeStamp);
			const ts= await Transaction.find({updatedTimeStamp:{$gt:lastupdatedTimeStamp}});
			console.log(ts);
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(res.body.length).toBe(3);
			expect(Object.keys(res.body[0])).toEqual(
				expect.arrayContaining(['userName','userPhoneNumber','userId','friendName','friendPhoneNumber','amount','updatedTimeStamp','interestRate','interestType','transactionDate','_id',]))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
			
		});
		
	});
//Coverage for cover and path not taken good idea
	describe('POST/',()=>{
		let token,userid;
		let payload;
		let friendName,friendPhoneNumber,amount,interestRate,interestType,transactionDate,description;
		let userName,userPhoneNumber,randomfield;
		const exec = () => {
			return  request(server)
			.post('/api/transactions')
			.set('x-auth-token',token)
			.send(payload)
		}
		beforeEach(()=>{
			userid= mongoose.Types.ObjectId();
			token = new User({_id:userid,phoneNumber:"1234123412",name:"name1"}).generateAuthToken();
			friendName = "name2";
			amount = 1;
			friendPhoneNumber = "1234512345";
			transactionDate = "2023-02-02T06:44:31.118Z";
			interestRate = 12.05;
			interestType = 'CW';
			payload = {friendName,amount,interestRate,interestType,friendPhoneNumber,transactionDate};
		})
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');
		})
		//Path-03
		it('should return 400 if validation transaction failed due to try to feed username',async()=>{
			userName = "Ramm";
			payload = {userName}
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body.message);
			//expect(res.body.message).toBe();
		})
		//Path-04
		it('should return 400 if validation transaction failed due to try to feed userPhoneNumber',async()=>{
			userPhoneNumber = "1231231231";
			payload = {userPhoneNumber}
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body.message);
			//expect(res.body.message).toBe();
		})
		//Path-05,shoudl cover updatedTimeStamp,deleteFlag,userid same as username and random
		it('should return 400 if validation transaction failed due to try to feed username',async()=>{
			randomfield = "Ramm";
			payload = {randomfield};
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body.message);
			//expect(res.body.message).toBe();
		})
		//Path-06
		it('should return 400 if validation transaction failed due to friendName -null',async()=>{
			friendName = null;
			payload = {...payload,friendName};
			const res = await exec();
			expect(res.status).toBe(400);
			//null and random value sasme no inoput is required 
			expect(res.body.message).toBe('"friendName" must be a string');
		})
		//Path-07
		it('should return 400 if validation transaction failed due to friendName-not a string',async()=>{
			friendName = 12;
			payload = {...payload,friendName};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe( '"friendName" must be a string');
		})
		//Path-08
		it('should return 400 if validation transaction failed due to PhoneNumber-not given',async()=>{
			friendPhoneNumber = null;
			payload = {...payload,friendPhoneNumber};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"friendPhoneNumber" must be a string');
		})
		//Path-09
		it('should return 400 if validation transaction failed due to PhoneNumber-not a number',async()=>{
			friendPhoneNumber = 12;
			payload = {...payload,friendPhoneNumber};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"friendPhoneNumber" must be a string');
		})
		//Path-10
		it('should return 400 if validation transaction failed due to PhoneNumber-not match number format',async()=>{
			friendPhoneNumber = "123123qwqw";
			payload = {...payload,friendPhoneNumber};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');
		})
		//Path-11
		it('should return 400 if validation transaction failed due to amount-not a number',async()=>{
			amount = "123123qwqw";
			payload = {...payload,amount};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"amount" must be a number');
		})
		//Path-12
		it('should return 400 if validation transaction failed due to amount-too small  number',async()=>{
			amount = -1000000001;
			payload = {...payload,amount};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"amount" must be greater than or equal to -1000000000');
		})
		//Path-13
		it('should return 400 if validation transaction failed due to amount-too big number',async()=>{
			amount = 1000000001;
			payload = {...payload,amount};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"amount" must be less than or equal to 1000000000');
		})
		//Path-14
		it('should return 400 if validation transaction failed due to interestRate-not a number',async()=>{
			interestRate = "123123qwqw";
			payload = {...payload,interestRate};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"interestRate" must be a number' );
		})
		//Path-15
		it('should return 400 if validation transaction failed due to interestRate-too small  number',async()=>{
			interestRate = -12;
			payload = {...payload,interestRate};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"interestRate" must be greater than or equal to 0');
		})
		//Path-16
		it('should return 400 if validation transaction failed due to interestRate-too big number',async()=>{
			interestRate = 104;
			payload = {...payload,interestRate};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"interestRate" must be less than or equal to 100');
		})
		//Path-17
		it('should return 400 if validation transaction failed due to interestType-invalid format',async()=>{
			interestType = 102;
			payload = {...payload,interestType};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"interestType" must be one of [S, N, CY, CW, CM]');
		})
		//Path-18
		it('should return 400 if validation transaction failed due to interestType-invalid type',async()=>{
			interestType = 'C';
			payload = {...payload,interestType};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"interestType" must be one of [S, N, CY, CW, CM]');
		})
		//Path-19
		it('should return 400 if validation transaction failed due to date',async()=>{
			transactionDate = null;
			payload = {...payload,transactionDate};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"transactionDate" must be a valid date');
		})
		//Path-20
		it('should return 400 if validation transaction failed due to attachmentsPath-not array',async()=>{
			attachmentsPath = "imageurl";
			payload = {...payload,attachmentsPath};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"attachmentsPath" must be an array');
		})
		//Path-21
		it('should return 400 if validation transaction failed due to attachmentsPath-not String',async()=>{
			attachmentsPath = [false];
			payload = {...payload,attachmentsPath};
			const res = await exec();
			expect(res.status).toBe(400);
			//make it relaxing check
			expect(res.body.message).toBe('"attachmentsPath[0]" must be a string');
		})
		//Path-22
		it('should return 400 if validation transaction failed due to attachmentsPath-size of array',async()=>{
			attachmentsPath = ["imageurl","q","qw","qw","we"];
			payload = {...payload,attachmentsPath};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"attachmentsPath" must contain less than or equal to 4 items');
		})
		//Path-23
		it('should return 400 if validation transaction failed due to description not a string',async()=>{
			description = 12;
			payload = {...payload,description};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"description" must be a string' );
		})
		//Path-24
		it('should return 400 if validation transaction failed due to description too long',async()=>{
			description = "a".repeat(501);
;
			payload = {...payload,description};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"description" length must be less than or equal to 500 characters long');
		})
		//Path-25
		it('should save and return transaction if valid transaction ',async()=>{
			const res = await exec();
//			console.log(res)
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['userName','userPhoneNumber','friendName','friendPhoneNumber','amount']))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
			// Check if the user is saved in the database
			const savedTransaction = await Transaction.findOne({ userPhoneNumber: "1234123412" });//from before each picked
			expect(savedTransaction).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedTransaction.friendPhoneNumber).toBe(friendPhoneNumber);			
		})
		//Path-26
		it('should save and return transaction if valid transaction-if valid description provided ',async()=>{
			description="just a note";
			payload = {...payload,description};
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['userName','userPhoneNumber','friendName','friendPhoneNumber','amount','updatedTimeStamp']))
			//check header->no chnage so not send
			//expect(res.headers['x-auth-token']).toBeDefined();
			// Check if the user is saved in the database
			const savedTransaction = await Transaction.findOne({ userPhoneNumber: "1234123412" });//from before each picked
			expect(savedTransaction).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedTransaction.friendPhoneNumber).toBe(friendPhoneNumber);	
			expect(savedTransaction.description).toBe(description);				
		})
});

	//Delete testing
//check length of transaction form 1 to 0 if actual delete
	describe('DELETE/',()=>{
		let token,token2;
		let transactionId;
		let updatedTimeStamp;
		//async await remove as direct return
		const exec = () => {
			return  request(server)
			.delete('/api/transactions/delete')
			.set('x-auth-token',token)
			.send({id:transactionId})
		}
		beforeEach(async()=>{
				userid = mongoose.Types.ObjectId();
				userid2 = mongoose.Types.ObjectId();
			 	transaction1 = {
				friendName : "name2",
				amount : 1,
				interestRate:12,
				interestType:'CW',
				friendPhoneNumber : "1234512345",
				userName:'name1',
				userId:userid,
				userPhoneNumber:"1231231231",
				transactionDate: "2023-02-02T06:44:31.118Z",
				description:"just a note"
					}
			const transaction = await new Transaction(transaction1).save()
			updatedTimeStamp = transaction.updatedTimeStamp;
			token = new User({_id:userid,phoneNumber:"1231231231",name:"name1"}).generateAuthToken();
			token2 = new User({_id:userid2,phoneNumber:"1231231230",name:"name2"}).generateAuthToken();
			transactionId = transaction._id
		})
		
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');;
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');
		})
		//Path-03
		it('should return 400 if validation fails  ',async()=>{
			transactionId = "1"
			const res = await  exec();
			expect(res.status).toBe(400);
			//make it bit relaxed check
			expect(res.body.message).toBe('"transactionId" with value "1" fails to match the valid mongo id pattern' );
		})
		//Path-04
		it('should return 400  if transaction not found with given ID/if Already delete ',async()=>{
			transactionId=userid;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('No Such Transaction exits wrong id provided' );

		})
		//Path-05
		it('should return 403  if user forbidden to do this ',async()=>{
			token=token2;
			const res = await exec();
			expect(res.body.message).toBe('Not Access for deleting');
			expect(res.status).toBe(403);
		})
		//Path-06
		it('should delete transaction if valid transaction ',async()=>{
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['userName','userPhoneNumber','friendName','friendPhoneNumber','amount','deleteFlag']))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
			// Check if the user is saved in the database
			//for array return vs single object return change statement
			const savedTransaction = await Transaction.findOne({ _id: transactionId });
			expect(savedTransaction).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedTransaction.deleteFlag).toBe(true);
			//chec this flag as importance
			expect(savedTransaction.updatedTimeStamp).not.toEqual(updatedTimeStamp);

		});

		
	});	
});
