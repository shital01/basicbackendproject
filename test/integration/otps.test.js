const request = require('supertest');
const {Otp} = require('../../models/otp');
const bcrypt = require('bcrypt');
const {User} = require('../../models/user');
const mongoose = require('mongoose');
let server;
/*
validation paths ->all variable and all constrain
less field or more fields
check entries being saved or count and additional checks
check response code ,either error or response to be null
check response headers
check response content
*/
describe('/api/otps',()=>{
	beforeEach(async()=>{
		server = require('../../index')
		await Otp.deleteMany({});
		await User.deleteMany({});
	})
	afterEach(async()=>{
		await Otp.deleteMany({});
		await User.deleteMany({});
		await server.close();

		});
	describe('GET /',()=>{
		let phoneNumber;
		const exec = () => {
			return  request(server)
			.post('/api/otps/generate')
			.send({phoneNumber})
		}
		beforeEach(()=>{
			phoneNumber="1234512345";
		})
		//Constains->String,10 digit RegEx,Required
		//Path-01
		it('should return 400 if validation OTP failed due to short number',async()=>{
			phoneNumber = "1";//all phonemnumebein one for loop
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');
		})
		//Path-02
		it('should return 400 if validation OTP failed due to long number',async()=>{
			phoneNumber = "12345678901";
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');

		})
		//Path-03//Non String Path
		it('should return 400 if validation OTP failed due to invalid type as digit',async()=>{
			phoneNumber = 1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"phoneNumber" must be a string');
		})
		//Path-04//RegEx Paths
		it('should return 400 if validation OTP failed due to invalid number as string',async()=>{
			phoneNumber = "12345qwert";
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');
		})
		//Path-05//Required Path?
		it('should return 400 if validation OTP failed due to null',async()=>{
			phoneNumber = null;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"phoneNumber" must be a string');
		})
		//Path-06//All is Well Path
		//Add path for testing numbers
		//Add export varible to avoid sms send error
		it('should save otp if valid otp',async()=>{
			const res = await exec();
			console.log(phoneNumber);
			console.log(res.body)
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//expect(res.headers['x-auth-token']).toBeDefined();
			//response check
			expect(res.body).toHaveProperty('SendSMS', true);
			// Check if the otp is saved in the database
			const savedOtp = await Otp.findOne({ phoneNumber: phoneNumber });
			expect(savedOtp).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedOtp.phoneNumber).toBe(phoneNumber);
		})
	})
	describe('POST/',()=>{
		let otp;
		let phoneNumber;
		let OTPhashed
		let phoneNumber1,phoneNumber2,phoneNumber3
		const exec = () => {
			return  request(server)
			.post('/api/otps/verify')
			.send({otp,phoneNumber})
		}
		beforeEach(async()=>{
			//just to
			await Otp.deleteMany({});
			await User.deleteMany({});
			//await User.collection.dropIndex('phoneNumber_1');

			otp = "1234";
			phoneNumber1 = "1234567890";
			phoneNumber2 = "1231231231";
			phoneNumber3 = "1234512346";
		})
		afterEach(async()=>{
			await Otp.deleteMany({});
			await User.deleteMany({});
			//await User.collection.dropIndex('phoneNumber_1');

		})
		//Path-01
		it('should return 400 if validation OTP failed due to in valid phoneNumber length',async()=>{
			phoneNumber="1";
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');

		})
		//Path-02
		it('should return 400 if validation OTP failed due to in valid phoneNumber RegEx',async()=>{
			phoneNumber="12345qwert";
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Phone number must have 10 digits.');

		})
		//Path-03
		it('should return 400 if validation OTP failed due to in valid phoneNumber not as string',async()=>{
			phoneNumber=1234567890;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"phoneNumber" must be a string');

		})
		//Path-04
		it('should return 400 if validation OTP failed due to OTP digits',async()=>{
			otp="1";
			phoneNumber=phoneNumber1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('OTP  must have 4 digits.');

		})
		//Path-05
		it('should return 400 if validation OTP failed due to OTP as string',async()=>{
			otp="1as3";
			phoneNumber=phoneNumber1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('OTP  must have 4 digits.');

		})
		//Path-06
		it('should return 400 if validation OTP failed due to OTP invalid format and phonenumber',async()=>{
			otp="1";
			phoneNumber="123";
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe("Phone number must have 10 digits.");

			//wont work joi checks first failure so even random field if only given nto say random but firsr arg missing
			//expect(res.body.message).toBe('OTP  must have 4 digits.');

		})
		//Path-07
		it('should return 404 if wrong OTP as not requested no entry and also new user',async()=>{
			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			phoneNumber=phoneNumber3;
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body.message).toBe( 'Invalid OTP');


		})
		//Path-08
		it('should return 404 if wrong OTP and user is new ',async()=>{
			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			phoneNumber=phoneNumber1;
			otp="1111";
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body.message).toBe( 'Invalid OTP');

		})
		//Path-09
		it('should return 200 if correct OTP and user is new ',async()=>{
			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			phoneNumber=phoneNumber1;
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['_id','phoneNumber']))
			//check header
			expect(res.headers['x-auth-token']).toBeDefined();
			// Check if the user is saved in the database
			const savedUser = await User.findOne({ phoneNumber: phoneNumber });
			expect(savedUser).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedUser.phoneNumber).toBe(phoneNumber);

		})
		//Path-10
		it('should return 404 if wrong OTP as not requested no entry and also old user',async()=>{

			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			await User.collection.insertMany([{phoneNumber:phoneNumber1,name:"name1"},{phoneNumber:phoneNumber3,name:"name1"}])
			phoneNumber=phoneNumber3;
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body.message).toBe( 'Invalid OTP');

		})
		//Path-11
		it('should return 404 if wrong OTP and user is old ',async()=>{

			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			await User.collection.insertMany([{phoneNumber:phoneNumber1,name:"name1"},{phoneNumber:phoneNumber3,name:"name1"}])
			phoneNumber=phoneNumber1;
			otp="1111";
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body.message).toBe( 'Invalid OTP');

		})
		//Path-12
		it('should return 200 if correct OTP and user is old ',async()=>{

			await Otp.collection.insertMany([{phoneNumber:phoneNumber1,otp:otp},{phoneNumber:phoneNumber2,otp:otp}])
			await User.collection.insertMany([{phoneNumber:phoneNumber1,name:"name1"},{phoneNumber:phoneNumber3,name:"name1"}])
			phoneNumber=phoneNumber1;
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['_id','phoneNumber']))
			//check header
			expect(res.headers['x-auth-token']).toBeDefined();
	
			// Check if the user is saved in the database
			const savedUser = await User.findOne({ phoneNumber: phoneNumber });
			expect(savedUser).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedUser.phoneNumber).toBe(phoneNumber);
		})
	})
})