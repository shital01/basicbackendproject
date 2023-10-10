/*const { MongoClient } = require('mongodb');

describe('MongoDB 500 Error', () => {
  let connection;
  let db;

  beforeAll(async () => {
    // Establish a connection to the test database
    connection = await MongoClient.connect('mongodb://localhost:27017/test');
    db = connection.db();
  });

  afterAll(async () => {
    // Close the connection and clean up
    await connection.close();
  });

  it('should throw a 500 error when inserting invalid data', async () => {
    // Trigger the error condition by attempting to insert invalid data
    const collection = db.collection('users');
    const invalidData = { name: 12 }; // Assuming 'name' field cannot be null
    let error;

    try {
      await collection.insertOne(invalidData);
    } catch (err) {
      error = err;
    }

    // Assert that a MongoDB 500 error occurred
    expect(error).toBeDefined();
    expect(error.code).toBe(500);
  });

  // Add more test cases as needed
});

/*const index = require('../../index');

test('should handle unhandled rejections', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const throwMock = jest.spyOn(global, 'throw').mockImplementation();

  // Simulate an unhandled rejection
  const error = new Error('Unhandled rejection');
  process.emit('unhandledRejection', error);

  // Verify the console.log and throw calls
  expect(consoleLogSpy).toHaveBeenCalledWith(error);
  expect(throwMock).toHaveBeenCalledWith(error);

  // Restore the original console.log method and global.throw
  consoleLogSpy.mockRestore();
  throwMock.mockRestore();
});


/*

test('should handle unhandled rejection', async () => {
  await expect(Promise.reject(new Error('Unhandled rejection')))
    .rejects.toThrowError('Unhandled rejection');
});


test('should throw unhandled rejection', () => {
  // Expecting a promise to be rejected
  expect(async () => {
    await Promise.reject(new Error('Unhandled rejection'));
  }).toThrowError();

  // Expecting a function to throw an error
  expect(() => {
    throw new Error('Unhandled error');
  }).toThrowError();
});
*/

const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');

let server;

describe('/api/upload routes',()=>{
	beforeEach(()=>{server = require('../../index')})
	afterEach(async()=>{
		await server.close();
		await User.deleteMany({});
		});
	describe('GET /',() =>{
			let userid,token;
			userid = mongoose.Types.ObjectId();
			//Happy Path
			let exec = () => {
			return  request(server)
			.get('/api/uploadurlrequest/')
			.set('x-auth-token',token)
			}
			beforeEach(async()=>{
				token = new User({_id:userid,phoneNumber:"1231231231",name:"name1"}).generateAuthToken();

			})
		it('should return 401 for No token',async() =>{
			token ='';
			const res = await exec();
			expect(res.status).toBe(401);
			expect(res.body.message).toBe('Access denied NO token Provided');

		});
		it('should return 400 for invalid token',async() =>{
			token ='1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('Invalid Token');

		});
		it('should return URL',async() =>{
			const res = await exec();
			//Put check on return type key and url as contain userid
      //response code 200 and empty error body and non empty response
      expect(res.status).toBe(200);
      //expect(res.body.error).toBe(null);
      //response check-only key enough
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['key']))
      //check header
      expect(res.headers['x-auth-token']).toBeDefined();
		});
	});

})
