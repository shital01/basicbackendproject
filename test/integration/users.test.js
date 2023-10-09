const request = require('supertest');
const mongoose = require('mongoose');

const {User} = require('../../models/user');

let server;
describe('/api/users',()=>{
	beforeEach(()=>{server = require('../../index')})
	afterEach(async()=>{
		await User.deleteMany({});
		await server.close();
		});	
	describe('Update user profile/',()=>{
		let token,token2;
		let name,profilePictureUrl,payload;
		const exec = () => {
			return  request(server)
			.put('/api/users/updateprofile')
			.set('x-auth-token',token)
			.send(payload)
		}
		beforeEach(async()=>{
			const user = new User({phoneNumber:"1234123412",name:"123"})
			await user.save()
			token = user.generateAuthToken();
			const user2 = new User({phoneNumber:"1231231231",name:"123123"})
			//await user2.save()
			token2 = user2.generateAuthToken();
			name = "newName";
			profilePictureUrl ="newImage"
			payload={name,profilePictureUrl};
		})
		afterEach(async()=>{
			await User.deleteMany({});
		})
		//Path-01
		it('should return 401 if no token provided',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
			console.log(res.body);
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		})
		//Path-03
		it('should return 400 if validation fail due to name validation-not string',async()=>{
			name = 3;
			payload={name};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-04
		it('should return 400 if validation fail due to name validation- too long',async()=>{
			name = "a".repeat(501);
			payload={name};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-05
		it('should return 400 if validation fail due to name validation-null',async()=>{
			name = 1;
			payload={name};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-06
		it('should return 400 if validation fail due to PhoneNumber  not allowed to be changed',async()=>{
			phoneNumber = "1231231231";
			payload={phoneNumber};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-07
		it('should return 400 if validation fail due to ContactsSent flag not allowed to be changed',async()=>{
			contactsSent = true;
			payload={contactsSent};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-08
		it('should return 400 if validation fail due to random field to change',async()=>{
			pancard = "23";
			payload={pancard};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-09
		it('should return 400 if validation fail due to profilePictureUrl validation-not string',async()=>{
			profilePictureUrl = 3;
			payload={profilePictureUrl};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-10 check what code
		it('should return 400  if user is not exits  ',async()=>{
			token=token2
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		})
		//Path-11
		it('should return 400 if validation fail due to profilePictureUrl and name both  validation failed',async()=>{
			profilePictureUrl = 3;
			name=12
			payload={name,profilePictureUrl};
			const res = await exec();
			expect(res.status).toBe(400);	
			console.log(res.body);
		})
		//Path-12
		it('should return 200 if only name is changed',async()=>{
			name = "1";
			payload = {name};
			const res = await exec();
			
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			expect(res.headers['x-auth-token']).toBeDefined();
			//response check
			expect(res.body).toHaveProperty('name', "1");
			// Check if the otp is saved in the database
			const savedUser = await User.findOne({ phoneNumber: "1234123412" });
			expect(savedUser).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedUser.name).toBe(name);
		})
		//Path-13//notworking
		it('should return 200 if only profilePictureUrl is changed',async()=>{
			profilePictureUrl = "1";
			payload = {profilePictureUrl};
			const res = await exec();
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			expect(res.headers['x-auth-token']).toBeDefined();
			//response check
			expect(res.body).toHaveProperty('profilePictureUrl', "1");
			// Check if the otp is saved in the database
			const savedUser = await User.findOne({ phoneNumber: "1234123412" });
			expect(savedUser).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedUser.profilePictureUrl).toBe(profilePictureUrl);

		})
		//Path-14//notworking
		it('should return 200 if both are changed',async()=>{
			const res = await exec();
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			expect(res.headers['x-auth-token']).toBeDefined();
			//response check
			console.log(res.body)
			expect(res.body).toHaveProperty('name', "newName");
			expect(res.body).toHaveProperty('profilePictureUrl', "newImage");

			expect(Object.keys(res.body)).toEqual(
				expect.arrayContaining(['name','profilePictureUrl']))
			
			// Check if the otp is saved in the database
			const savedUser = await User.findOne({ phoneNumber: "1234123412" });
			expect(savedUser).toBeTruthy(); // Check if the user exists
			// Add more specific checks 
			expect(savedUser.name).toBe("newName");
			expect(savedUser.profilePictureUrl).toBe("newImage");
		})
	})
		

	//For friends Profile pic url
	describe('FriendsProfile/',()=>{
		let token;
		let phoneNumber,phoneNumbers;
		const exec = () => {
			return  request(server)
			.post('/api/users/friendsprofile')
			.set('x-auth-token',token)
			.send({phoneNumbers})
		}
		beforeEach(async()=>{
			//optional to be safe if something goes wrong
			await User.deleteMany({});

			const user = new User({phoneNumber:"1234123411",name:"name1",profilePictureUrl:"imageurl"})
			await user.save()
			const user1 = new User({phoneNumber:"1234123412",name:"name2",profilePictureUrl:"imageurl2"})
			await user1.save()
			token = user.generateAuthToken();
			const user2 = new User({phoneNumber:"1234123410",name:"name1"})
			await user2.save()
			phoneNumber = "1234123412";
			phoneNumbers =["1234123412","1234123411","1212121212"];
		})
		afterEach(async()=>{
			await User.deleteMany({});
		})
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
			console.log(res.body);
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		})
		//Path-03
		it('should return 400 if validation fail->not an array  ',async()=>{
			phoneNumbers = "1";
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		})
		//Path-04
		it('should return 400 if validation fail -not array of string ',async()=>{
			phoneNumbers = [1];
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		});
		//Path-05
		it('should return 400 if validation fail -array not appropriate inputs ',async()=>{
			phoneNumbers = ["1123qweqwe"]
			const res = await exec();
			expect(res.status).toBe(400);
			console.log(res.body);
		});
		//Path-07
		it('should return Profileurl  if user is have a picture uploaded-if some users find and some profilePictureUrl',async()=>{
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			//check in case null entries no issues of array can be of 0,1 or more than one
			expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['_id','name','phoneNumber','profilePictureUrl']))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
		})	
		//Path-08
		it('should return Profileurl  if user is have a picture uploaded-if no user found',async()=>{
			phoneNumbers = ["1231112311"];
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(404);
			//expect(res.body.error).toBe(null);
			//response check
			//check in case null entries no issues of array can be of 0,1 or more than one
			//expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['_id','name','profilePictureUrl']))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
		})	
		//Path-09
		it('should return Profileurl  if user is have a picture uploaded-if user found but no profilePictureUrl',async()=>{
			phoneNumbers = ["1234123410"];
			const res = await exec();
			//response code 200 and empty error body and non empty response
			expect(res.status).toBe(200);
			//expect(res.body.error).toBe(null);
			//response check
			//check in case null entries no issues of array can be of 0,1 or more than one
			expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['_id','name','phoneNumber']))
			//check header
			//expect(res.headers['x-auth-token']).toBeDefined();
		})	
				
	})




})

