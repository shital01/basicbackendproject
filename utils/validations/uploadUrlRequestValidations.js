const Joi = require('joi');

const uploadUrlRequestSchema = Joi.object({
    name: Joi.string().allow(null, '').max(64),
    profilePictureUrl: Joi.string().allow(null, ''),
    fcmToken: Joi.string().allow(null, ''),
    contactsSent: Joi.boolean(),
});


module.exports = {
    uploadUrlRequestSchema: uploadUrlRequestSchema
};