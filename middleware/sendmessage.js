const axios = require("axios");
const config = require('config');
const logger = require('../startup/logging');


async function sendmessage(send_to, message,TemplateId) {
    const urlencodedmessage = encodeURIComponent(message);
    const options = {
      method: 'POST',
      url: 'https://enterpriseapi.smsgupshup.com/GatewayAPI/rest',
      data: {
        method: 'sendMessage',
        send_to: send_to,
        msg: urlencodedmessage,
        msg_type: 'TEXT',
        v:'1.1',
        userid: config.get('userid'),
        auth_scheme: 'PLAIN',
        password: config.get('password'),
        format: 'TEXT',
        principalEntityId:'1601568168456313537',
        dltTemplateId:TemplateId
      }
    };

const requestURL = options.url + '?method=' + options.data.method +
    '&send_to=' + options.data.send_to +
    '&msg=' + options.data.msg +
    '&msg_type=' + options.data.msg_type +
    '&userid=' + options.data.userid +
    '&auth_scheme=' + options.data.auth_scheme +
    '&password=' + options.data.password +
    '&format=' + options.data.format;
console.log(requestURL);
  logger.info('Final URL:'+ requestURL);


const response = await axios(options);
    if (response.status === 200) {
    	//console.log(response);
      //console.log('Message sent successfully');
      return true;
    } 
}

module.exports = sendmessage;

