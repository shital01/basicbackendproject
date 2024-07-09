const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const getTransactionsSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
    pageNumber: Joi.number().integer(),
});

const getTransactionsSchemaV2 = Joi.object({
    cursorTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
});

const updateSeenStatusSchema = Joi.object({
    transactionIds: Joi.array().items(Joi.objectId().required()),
});

const transactionSchema = Joi.object({
    transactionDate: Joi.date().timestamp('unix').required(),
    amount: Joi.number()
        .required()
        .min(-1000000000)
        .max(1000000000)
        .required(),
    amountGiveBool: Joi.boolean(),
    khataId: Joi.objectId().required(),
    description: Joi.string().allow(null, '').max(500),
    attachmentsPath: Joi.array().items(Joi.string()).max(4),
});

const transactionSchema2 = Joi.object({
    transactionDate: Joi.date().timestamp('unix').required(),
    amount: Joi.number()
        .required()
        .min(-1000000000)
        .max(1000000000)
        .required(),
    amountGiveBool: Joi.boolean(),
    khataId: Joi.objectId().required(),
    description: Joi.string().allow(null, '').max(500),
    attachmentsPath: Joi.array().items(Joi.string()).max(4),
    localId: Joi.string().required(),
    sendSms: Joi.boolean(),
});

module.exports = {
    getTransactionsSchema,
    getTransactionsSchemaV2,
    updateSeenStatusSchema,
    transactionSchema,
    transactionSchema2
};