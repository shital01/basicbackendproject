const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const getTransactionsSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
    pageNumber: Joi.number().integer(),
});

const updateSeenStatusSchema = Joi.object({
    transactionIds: Joi.array().items(Joi.objectId().required()),
});

module.exports = {
    getTransactionsSchema,
    updateSeenStatusSchema
};