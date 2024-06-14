const request = require('supertest');
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');

const { Contact } = require('../../models/contact');
const { User } = require('../../models/user');

let server;
describe('/api/contact', () => {
	beforeEach(() => {
		server = require('../../index');
	});
	afterEach(async () => {
		await server.close();
		await Contact.deleteMany({});
		await User.deleteMany({});
	});
	//Coverage for cover and path not taken good idea
	describe('POST/', () => {
		let token, user;
		let payload;
		let P, N, phoneNumber, name;
		const exec = () => {
			return request(server)
				.post('/api/contact/addcontacts')
				.set('x-auth-token', token)
				.send(payload);
		};
		beforeEach(async () => {
			//userid= mongoose.Types.ObjectId();
			user = new User({ phoneNumber: '1234123412', name: 'name1' });
			token = user.generateAuthToken();

			payload = {
				C: [
					{ P: '1231231231', N: 'name1' },
					{ P: '1231231232', N: 'name2 ' },
				],
			};
		});
		//Path-01
		it('should return 401 if not logged in', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');
		});
		//Path-02
		it('should return 400 if invalid token ', async () => {
			token = '123';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');
		});
		//Path-03
		it('should return 400 if validation inpute failed due to-not an array', async () => {
			payload = { C: { P: '1231231231', N: 'name1' } };
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"C" must be an array');
		});
		//Path-04
		it('should return 400 if validation input failed due to - not a string in phone number', async () => {
			payload = {
				C: [
					{ P: 1231231231, N: 'name1' },
					{ P: '1231231232', N: 'name2 ' },
				],
			};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"C[0].P" must be a string');
		});
		//Path-05
		it('should return 400 if validation inpute failed due to - not a string in name ', async () => {
			payload = {
				C: [
					{ P: '1231231231', N: true },
					{ P: '1231231232', N: 'name2 ' },
				],
			};
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('"C[0].N" must be a string');
		});
		//Path-06
		// it('should save and but cant return as no user found    ', async () => {
		// 	payload = {}
		// 	const res = await exec();
		// 	//response code 200 and empty error body and non empty response
		// 	expect(res.status).toBe(404);
		// 	expect(res.body.message).toBe('No User exits');

		// 	//console.log(res)
		// 	//expect(res.body.error).toBe(null);
		// 	//response check
		// 	//expect(res.body).toHaveProperty('contactsSent', true);
		// 	//check header
		// 	//expect(res.headers['x-auth-token']).toBeDefined();
		// 	// Check if the user is saved in the database
		// 	const savedContacts = await Contact.findOne({}); //from before each picked
		// 	expect(savedContacts).toBeTruthy(); // Check if the user exists
		// 	//expect(savedContacts.length).toBe(2);
		// 	// Add more specific checks
		// 	//check user flag of contact sedn and size depedn on input and delte after each
		// });
		// //Path-07
		// it('should save and return ContactsSend flag if valid  ', async () => {
		// 	await user.save();

		// 	const res = await exec();
		// 	//response code 200 and empty error body and non empty response
		// 	expect(res.status).toBe(200);
		// 	//console.log(res)
		// 	//expect(res.body.error).toBe(null);
		// 	//response check
		// 	//expect(res.body).toHaveProperty('contactsSent', true);
		// 	//check header
		// 	expect(res.headers['x-auth-token']).toBeDefined();
		// 	// Check if the user is saved in the database
		// 	const savedContacts = await Contact.find({}); //from before each picked
		// 	expect(savedContacts).toBeTruthy(); // Check if the user exists
		// 	//expect(savedContacts.length).toBe(2);
		// 	// Add more specific checks
		// 	//check user flag of contact sedn and size depedn on input and delte after each
		// 	const savedUser = await User.find({}); //from before each picked
		// 	console.log(savedUser);
		// 	expect(savedUser).toBeTruthy();
		// 	expect(savedUser[0].contactsSent).toBe(true);
		// });
	});
});
