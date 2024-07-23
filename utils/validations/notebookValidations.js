const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const getNotebooksSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
    pageNumber: Joi.number().integer(),
});

const createNotebooksSchema = Joi.object({
    ownerId: Joi.objectId().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    collaborators: Joi.array().items(Joi.objectId().required()),
    khataIds: Joi.array().items(Joi.objectId().required()),
    createdTimeStamp: Joi.date().timestamp('unix'),
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
})

const updateNotebooksSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    khataIds: Joi.array().items(Joi.objectId()),
});


module.exports = { getNotebooksSchema, createNotebooksSchema, updateNotebooksSchema }