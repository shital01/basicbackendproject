const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const loginSchema = Joi.object({
    phoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    otp: Joi.string()
        .regex(/^[0-9]{4}$/)
        .messages({ 'string.pattern.base': `OTP  must have 4 digits.` })
        .required(),
    fcmToken: Joi.string(),
});

const numberSchema = Joi.object({
    phoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
});

module.exports = {
    loginSchema,
    numberSchema: numberSchema
};