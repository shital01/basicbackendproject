const Joi = require('joi');


const messageSchema = Joi.object({
    userName: Joi.string(),
    userPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    amount: Joi.number().integer().required(),
    totalAmount: Joi.number().integer().required(),
});


const remindMessageSchema = Joi.object({
    userName: Joi.string(),
    userPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    totalAmount: Joi.number().integer().required(),
});

const deleteMessageSchema = Joi.object({
    userName: Joi.string(),
    userPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    amount: Joi.number().integer().required(),
    transactionDate: Joi.date(),
    totalAmount: Joi.number().integer().required(),
});


module.exports = {
    messageSchema,
    remindMessageSchema,
    deleteMessageSchema,
};