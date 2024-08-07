const { createClient } = require('redis');

const config = require('config');

const redisClient = createClient({
  url: config.get('redisUrl'),
});


redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

redisClient.connect();

module.exports = { redisClient }