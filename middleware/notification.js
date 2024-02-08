const admin = require('firebase-admin');
const logger = require('../startup/logging');

// Initialize Firebase Admin SDK
const serviceAccount = require('../../fcmkey.json'); // replace with your own service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create a function to send FCM notifications
async function sendFCMNotification(token, title, body,phoneNumber) {
  try {
     const message = {
      token: token,
      data: {
        title:title,
        body:body,
        action: 'view_message',
        phoneNumber:phoneNumber
      },
    };

    const response = await admin.messaging().send(message);
    //console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    logger.error('Error sending notification:', error);
    //throw error;
    return error
  }
}
//addchanel Id extra input



module.exports = sendFCMNotification