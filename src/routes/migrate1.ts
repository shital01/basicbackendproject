const MongoClient = require('mongodb').MongoClient;

// MongoDB connection string
const url = 'your-mongodb-connection-string';
const dbName = 'your-database-name';

// Sample old user data array
const oldUserData = [
	{
		_id: '64af8b60d5e5666049ce79e7',
		Name: 'John Doe',
		PhoneNumber: 1234567890,
		ProfilePictureUrl: 'http://example.com/profile.jpg',
	},
	// Add more user objects here
];

// Function to migrate User data
async function migrateUserData(data) {
	const client = new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const db = client.db(dbName);
		const newUserCollection = db.collection('User'); // New User table with updated field names

		// Migrate each user to the new User table
		for (const user of data) {
			await newUserCollection.insertOne({
				name: user.Name,
				phoneNumber: user.PhoneNumber,
				profilePic: user.ProfilePictureUrl,
			});
		}

		console.log('User table migrated successfully!');
	} finally {
		await client.close();
	}
}

// Call the function to migrate User data with the sample data
//migrateUserData(oldUserData);
