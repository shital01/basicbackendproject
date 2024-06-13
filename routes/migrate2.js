const MongoClient = require('mongodb').MongoClient;

// MongoDB connection string
const url = 'your-mongodb-connection-string';
const dbName = 'your-database-name';

// Function to create Khata table
async function createKhataTable(data) {
	const client = new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const db = client.db(dbName);
		const khataCollection = db.collection('Khata');

		// Set to keep track of processed pairs
		const processedPairs = new Set();

		// Process each transaction data
		for (const transaction of data) {
			const senderPhoneNumber = transaction.SenderPhoneNumber;
			const receiverPhoneNumber = transaction.ReceiverPhoneNumber;

			// Determine the unique pair key
			const pairKey = [senderPhoneNumber, receiverPhoneNumber]
				.sort()
				.join(',');

			// Skip if the pair has been processed
			if (processedPairs.has(pairKey)) {
				continue;
			}

			// Find userId based on senderPhoneNumber
			const senderUser = await db
				.collection('User')
				.findOne({ PhoneNumber: senderPhoneNumber });
			const senderUserId = senderUser ? senderUser.UserId : null;

			// Find userId based on receiverPhoneNumber
			const receiverUser = await db
				.collection('User')
				.findOne({ PhoneNumber: receiverPhoneNumber });
			const receiverUserId = receiverUser ? receiverUser.UserId : null;

			// Insert into Khata table
			await khataCollection.insertOne({
				userId: senderUserId,
				username: transaction.SenderName,
				userPhoneNumber: senderPhoneNumber,
				friendName: transaction.ReceiverName,
				friendPhoneNumber: receiverPhoneNumber,
				interestType: 'N',
			});

			// Mark the pair as processed
			processedPairs.add(pairKey);

			// If the receiver is a user, insert another record for them
			if (receiverUserId) {
				await khataCollection.insertOne({
					userId: receiverUserId,
					username: transaction.ReceiverName,
					userPhoneNumber: receiverPhoneNumber,
					friendName: transaction.SenderName,
					friendPhoneNumber: senderPhoneNumber,
					interestType: 'N',
				});
			}
		}

		console.log('Khata table created successfully!');
	} finally {
		await client.close();
	}
}

// Sample data
const sampleData = [
	{
		_id: '64af8b60d5e5666049ce79e7',
		SenderName: 'Shital Godara',
		SenderPhoneNumber: 1234567890,
		ReceiverPhoneNumber: 1212121212,
		ReceiverName: 'asd',
		Amount: 57,
	},
	// Add more transaction objects here
];

// Call the function with sample data
//createKhataTable(sampleData);
