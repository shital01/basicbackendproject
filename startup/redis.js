const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379',
});


redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

redisClient.connect();

module.exports = { redisClient }