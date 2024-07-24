const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const getNotebooksSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
});

const getNotebookSchema = Joi.object({
    notebookId: Joi.date().timestamp('unix'),
});


const createNotebooksSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
})

const updateNotebooksSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
});


module.exports = { getNotebooksSchema, getNotebookSchema, createNotebooksSchema, updateNotebooksSchema }