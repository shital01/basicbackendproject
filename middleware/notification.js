const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../../fcmkey.json'); // replace with your own service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create a function to send FCM notifications
async function sendFCMNotification(token, title, body,channelId) {
  try {
     const message = {
      token: token,
      /*notification:{
        title:"title1",
        body:"body1"
      },*/
      data: {
        title:"title2",
        body:"bk body",
        action: 'view_message',

       // ...dataPayload, // Additional data to be sent
      },
      /*android: {
        notification: {
          channelId: channelId, // Specify the channel ID here
        },
      },*/
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
//addchanel Id extra input



module.exports = sendFCMNotification