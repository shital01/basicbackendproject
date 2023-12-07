const request = require('supertest');
const mongoose = require('mongoose');

const {Transaction} = require('../../models/transaction');
const {User} = require('../../models/user');
const {Khata} = require('../../models/khata');

let server;
/*
attahcments max 4 or url type
max limit 10000 and handling
then date is unix type or not 

Date early and late max allow


*/
//Need 2 user minimum
//4 transaction -1 incorrect ,1 different user
//khatas also 2 as query internal for khatas
let t1,t2;
			const userid = mongoose.Types.ObjectId();
			const userid2 = mongoose.Types.ObjectId();
	
			const khata1id=mongoose.Types.ObjectId();
			const khata2id=mongoose.Types.ObjectId();

			const khata1 = {
				_id:khata1id,
				userName:"name1",
				friendName:"f1",
				userPhoneNumber:"1313131212",
				friendPhoneNumber:"1313131210",
				interestType : 'N',
				localId:'1',
				userId:userid,
				rotationPeriod: "3M",
				updatedTimeStamp: 1211231231231,
			}
			const khata2 = {
				_id:khata2id,
				userName:"name1",
				friendName:"f1",
				userPhoneNumber:"1313131213",
				friendPhoneNumber:"1313131210",
				interestType : 'N',
				localId:'2',
				userId:userid,
				rotationPeriod: "3M",
				updatedTimeStamp: 1211231231231,
			}

			const transaction1 = {
				khataId : khata1id,
				amount : 1,
				userName:"name1",
				userPhoneNumber:"1313131212",
				amountGiveBool : true,
				localId:'1',
				userId:userid,
				transactionDate: 1211231231231,
				updatedTimeStamp: 1211231231231,
			}
			const transaction2 = {
				khataId : khata2id,
				amount : 1,
				amountGiveBool : true,
				localId:'1',
				userId:userid,
				transactionDate: 1211231231232,
				updatedTimeStamp: 1211231231235,
				attachmentsPath:["firsturl","secondurl"]
			}
			const transaction3 = {
				khataId : khata1id,
				amount : 1,
				amountGiveBool : false,
				localId:'1',
				userId:userid,
				transactionDate: 1211231231232,
				updatedTimeStamp: 1211231231236,
			}
			const transaction4 = {
				khataId : khata2id,
				amount : 1,
				amountGiveBool : false,
				localId:'1',
				userId:userid2,
				transactionDate: 1211231231232,
				updatedTimeStamp: 1211231231236,
			}
			const transaction5 = {
				khataId : khata2id,
				amount : 1,
				amountGiveBool : true,
				localId:'1',
				userId:userid,
				transactionDate: 1211231231232,
				updatedTimeStamp: 1211231231235,
				attachmentsPath:["firsturl","secondurl","thirdurl","fourthurl","fifthurl"]
			}
describe('/api/transactions',()=>{

	beforeEach(()=>{
		server = require('../../index')}
		)
	afterEach(async()=>{
		await server.close();
		await Transaction.deleteMany({});
		await User.deleteMany({})
		await Khata.deleteMany({})
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
/*
	describe('GET /',() =>{
			
			//getData() transaction1,...4	
			//Happy Path
			var token;
			var payload={};
			let exec = (payload) => {
			return  request(server)
			.get('/api/transactions/')
			.set('x-auth-token',token)
			.query(payload)
			}
			beforeEach(()=>{
				
			token = new User({_id:userid,phoneNumber:"1313131212",name:"name1"}).generateAuthToken();		
			})
			afterEach(async()=>{
		await Transaction.deleteMany({});
		await User.deleteMany({})
		await Khata.deleteMany({})
		});
		it('should return 401 for No token',async() =>{
			token ='';
			const res = await exec();
			expect(res.status).toBe(401);
		});
		it('should return 400 for invalid token',async() =>{
			token ='1';
			const res = await exec();
			expect(res.status).toBe(400);
		});
		//handle all type of dates too not a dat etype,not a valid date,too early or too late
		it('should return 400 for invalid Date',async() =>{
			lastUpdatedTimeStamp =null;
			payload = {lastUpdatedTimeStamp}
			const res = await exec(payload);
			expect(res.status).toBe(400);
		});
		it('should return 400 for invalid pageSize',async() =>{
			const invalidPageSizes = [-3, 0, "12"];
		    for (const pageSize of invalidPageSizes) {
		        const payload = { pageSize };
		        const res = await exec(token, payload);
		        expect(res.status).toBe(400);
		    }
		});
		it('should return 400 for invalid pageNumber',async() =>{
			const invalidPageNumbers = [-3, 0, "12"];
		    for (const pageNumber of invalidPageNumbers) {
		        const payload = { pageNumber };
		        const res = await exec(token, payload);
		        expect(res.status).toBe(400);
		    }
		});
		//in success path also for max 10000 check ....
		it('should return all transactions with Date',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			//	console.log(token);
			//const k2 = await Khata.find({})
			//console.log(k2);
			//console.log(khatas);
			//const t2= await Transaction.find({})
			//console.log(t2)
			payload = {lastUpdatedTimeStamp:1211231231232}
			const res = await exec(payload);
			expect(res.status).toBe(200);
			console.log(res.body);
			console.log(res.body.results[0]);

			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
				});
		it('should return all transactions with Date and pageNumber',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			payload = {lastUpdatedTimeStamp:1211231231232,pageNumber:1}
			const res = await exec(payload);
			expect(res.status).toBe(200);
			console.log(res.body);
			console.log(res.body.results[0]);

			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
				


				});
		it('should return all transactions with Date and PageSize',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			payload = {lastUpdatedTimeStamp:1211231231232,pageSize:2}
			const res = await exec(payload);
			expect(res.status).toBe(200);
			console.log(res.body);
			console.log(res.body.results[0]);

			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
				});

		it('should return all transactions with Date and page size and pageNumber',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			payload = {lastUpdatedTimeStamp:1211231231232,pageSize:1,pageNumber:1}
			const res = await exec(payload);
			expect(res.status).toBe(200);
			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				

				});
		it('should return all transactions without Date',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.results.length).toBe(2);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
			
			});
		it('should return all transactions without Date and pagesize',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			const res = await exec({pageSize:1});
			expect(res.status).toBe(200);
			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
			
			});
		it('should return all transactions without Date and page number',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			const res = await exec({pageNumber:1});
			expect(res.status).toBe(200);
			expect(res.body.results.length).toBe(2);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
			
			});
		it('should return all transactions without Date and page size and pagenumber',async() =>{
			
			const khatas = await Khata.collection.insertMany([khata1,khata2])
			const transactions= await Transaction.collection.insertMany([transaction1,transaction2,transaction3,transaction4])
			const res = await exec({pageNumber:1,pageSize:1});
			expect(res.status).toBe(200);
			expect(res.body.results.length).toBe(1);
			expect(Object.keys(res.body.results[0])).toEqual(
				expect.arrayContaining(['deleteFlag','seenStatus','_id','khataId','amount','userId','amountGiveBool','localId','transactionDate','updatedTimeStamp']))				
			
			});
	
	});
/*********POST************/
//Get Request Paths Testing	
	//date tested in postman working but not in supertest nor date related query picking it up
//Coverage for cover and path not taken good idea

	describe('POST/',()=>{
		let token,userid;
		let Isloan,Amount,TransactionDate,Notes;
		const exec = () => {
			return  request(server)
			.post('/api/transactions/multiple')
			.set('x-auth-token',token)
			.send([t1,t2])
		}
		beforeEach(()=>{
			userid= mongoose.Types.ObjectId();
			token = new User({_id:userid,phoneNumber:"1313131212",name:"name1"}).generateAuthToken();
			
			//intialize here so one overwrite does do wrong 
			t1 = Object.assign({}, transaction1); // Create a copy of transaction1 to t1
    		t2 = Object.assign({}, transaction2); 
			delete t1.userId;
			delete t2.userId;
			delete t1._id;
			delete t2._id;
			delete t1.updatedTimeStamp;
			delete t2.updatedTimeStamp;
			delete t1.userName;
			delete t2.userName;
			delete t1.userPhoneNumber;
			delete t2.userPhoneNumber;


			console.log(JSON.stringify(t1))
		})
		afterEach(async()=>{
		await Transaction.deleteMany({});
		await User.deleteMany({})
		await Khata.deleteMany({})
		});
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
		})
		//now even if all fail wont get 400 due to muliptle instead unsaved and erorr response check 
		//also o how many saved vs how many not first this than other as unsaved and error part
		//Path-03
		it('should return 400 if validation transaction failed due to date',async()=>{
			t1.transactionDate = "a";
			console.log(t1,t2);
			const res = await exec();
			//console.log("**************************")
			console.log(res.body);
			//console.log("**************************")
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe('"transactionDate" must be in timestamp or number of seconds format');

			//strict field checkor error check

		})
		//Path-04
		it('should return 400 if validation transaction failed due to amount',async()=>{
			t1.amount = "12da";
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe('"amount" must be a number');		
		});
		//Path-05
		it('should return 400 if validation transaction failed due to Give/Got Boolean ',async()=>{
			t1.amountGiveBool = "12";
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			console.log(res.body.unsavedEntries);
			expect(res.body.unsavedEntries[0].error).toBe('"amountGiveBool" must be a boolean');	
		})
		//Path-06
		it('should return 400 if validation transaction failed due to KhataId ',async()=>{
			t1.khataId = "asd";
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toContain('fails to match the valid mongo id pattern');	
		})
		//Path-07
		it('should return 400 if validation transaction failed due to localId',async()=>{
			t1.localId = null;
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe('"localId" must be a string');
		})
		//Path-08
		//NEED to somehow create this error 
		/*
		it('should return 200 if  transaction failed due to mongodb issues',async()=>{
			//t1.localId = null;
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body.savedEntries.length).toBe(1);
			expect(res.body.unsavedEntries.length).toBe(1);
			expect(res.body.unsavedEntries[0].error).toBe('"localId" must be a string');
		})
		*/
		//handle optinal field too,succesful bare miniumum thenoptional too
		//Path-08
		
		it('should save and return transaction if valid transaction with no input parameter ',async()=>{
			t1.description="just a note";//make optional first
			const res = await exec();
			expect(res.status).toBe(200);
			//check the save part also 
			//const transaction = await Transaction.find({SenderName:"name1"});
			//expect(Object.keys(res.body)).toEqual(
			//	expect.arrayContaining(['SenderName','SenderPhoneNumber','ReceiverName','ReceiverPhoneNumber','Isloan','Amount']))
			 // Assuming res.body contains the response from your API
   			 const transactions = res.body.savedEntries;

    // Check if the response contains an array of transactions
 			   expect(Array.isArray(transactions)).toBe(true);
 			   expect(transactions).toHaveLength(2); // Adjust based on your expected length

    // Validate properties for each transaction
    transactions.forEach(transaction => {
        expect(transaction).toHaveProperty('userName');
        expect(transaction).toHaveProperty('userId');
        expect(transaction).toHaveProperty('userPhoneNumber');
        expect(transaction).toHaveProperty('amount');
        expect(transaction).toHaveProperty('amountGiveBool');
        expect(transaction).toHaveProperty('transactionDate');})
	})


});

/*************PUT*********/

	describe('PUT/',()=>{
		let token,token2;
		let transactionId;
		//async await remove as direct return
		const exec = () => {
			return  request(server)
			.put('/api/transactions')
			.set('x-auth-token',token)
			.send(payload)
		}
		beforeEach(async()=>{
			const transaction = await new Transaction(transaction1).save()
			token = new User({_id:userid,phoneNumber:"1231231231",name:"name1"}).generateAuthToken();
			token2 = new User({_id:userid2,phoneNumber:"1231231230",name:"name2"}).generateAuthToken();
			transactionId = transaction._id
			payload= {amount:101}
		})
		afterEach(async()=>{
		await Transaction.deleteMany({});
		await User.deleteMany({})	
		})
		
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
		})

		//Path-03
		it('should return 400 if validation transaction failed due to deleteFlag',async()=>{
			deleteFlag = null;//or false array input
			payload={deleteFlag,transactionId};
			const res = await exec();
			expect(res.status).toBe(400);
		})
		//Path-04
		it('should return 400 if validation transaction failed due to seenStatus',async()=>{
			seenStatus = "12da";
			payload = {seenStatus,transactionId}
			const res = await exec();
			expect(res.status).toBe(400);
		})
		
		
		//Path-08
		it('should return 400 if validation transaction failed due to invalid ID',async()=>{
			transactionId="1";
			payload ={transactionId}
			const res = await exec();
			expect(res.status).toBe(400);
		})

		//Path-09
		it('should return 403  if transaction not found with given ID/if Already delete ',async()=>{
			transactionId=userid;
			payload ={transactionId}

			const res = await exec();
			expect(res.status).toBe(400);
		})
		//Path-10//hold this test case due to condition of seen not jsut delete feature
		it('should return 403  if user forbidden to do this ',async()=>{
			token=token2;
			const res = await exec();
			//expect(res.status).toBe(403);
			expect(res.status).toBe(400);
		})
		//Path-11
		it('should delete transaction if valid transaction ',async()=>{
			payload={deleteFlag:true,transactionId}
			const res = await exec(payload);
			expect(res.status).toBe(200);
		})
		//Path-12
		it('should update the transaction and return valid response if valid transaction ',async()=>{
			payload={seenStatus:true,transactionId}
			const res = await exec(payload);
			expect(res.status).toBe(200);
			const transactions = await Transaction.find()
			expect(transactions[0].seenStatus).toBe(true);
		})
		
	})	
	
/********UPDATE SEEN STATUS******/

	describe('UPDATE SEEN STATUS/',()=>{
		let token,token2;
		let transactionIds;
		let payload;
		//async await remove as direct return
		const exec = () => {
			return  request(server)
			.put('/api/transactions/updateseenstatus')
			.set('x-auth-token',token)
			.send(payload)
		}
		beforeEach(async()=>{
			//console.log(transaction3);
			//console.log(transaction1)
			await Transaction.deleteMany({});
			await User.deleteMany({})
			const transaction11 = await new Transaction(transaction1).save()
			const transaction12 = await new Transaction(transaction1).save()

			token = new User({_id:userid,phoneNumber:"1231231231",name:"name1"}).generateAuthToken();
			token2 = new User({_id:userid2,phoneNumber:"1231231230",name:"name2"}).generateAuthToken();
			var transactionId1 = transaction11._id
			var transactionId2 = transaction12._id
			transactionIds=[transactionId1,transactionId2];
			payload= {transactionIds}
		})
		afterEach(async()=>{
		await Transaction.deleteMany({});
		await User.deleteMany({})	
		})
		
		//Path-01
		it('should return 401 if not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		})
		//Path-02
		it('should return 400 if invalid token ',async()=>{
			token="123"
			const res = await exec();
			expect(res.status).toBe(400);
		})

		//Path-03
		it('should return 400 if validation transaction failed due to transactions Ids not an array',async()=>{
			transactionIds = 123;//or false array input
			payload={transactionIds};
			const res = await exec();
			expect(res.status).toBe(400);
		})
		//Path-04
		it('should return 400 if validation transaction failed due to transaction Ids -invalid element',async()=>{
			transactionIds = [123];//or false array input
			payload={transactionIds};
			const res = await exec();
			expect(res.status).toBe(400);
		})
		
		
		//Path-08
		it('should return 400 if validation transaction failed due to invalid ID',async()=>{
			transactionIds=["1"];
			payload ={transactionIds}
			const res = await exec();
			expect(res.status).toBe(400);
		})

		//Path-09
		it('should return 404  if transaction not found with given ID/if Already delete ',async()=>{
			transactionIds=[userid];
			payload ={transactionIds}
			console.log(payload);
			const res = await exec();
			expect(res.status).toBe(404);
		})
		//No need this forbideen as only seen status changing
		//Path-10//hold this test case due to condition of seen not jsut delete feature
		//it('should return 403  if user forbidden to do this ',async()=>{
		//	token=token2;
		//	const res = await exec();
			//expect(res.status).toBe(403);
		//	expect(res.status).toBe(400);
		//})
		
		//Path-12
		it('should update the transaction and return valid response if valid transaction ',async()=>{
			const res = await exec();
			//console.log(res)
			expect(res.status).toBe(200);
			const transactions = await Transaction.find()
			expect(transactions[0].seenStatus).toBe(true);
			expect(transactions[1].seenStatus).toBe(true);

		})
		
	})	

});