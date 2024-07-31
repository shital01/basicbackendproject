const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const getNotebooksSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
});

const getNotebookSchema = Joi.object({
    notebookId: Joi.objectId().required(),
});

const createNotebooksSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});

const updateNotebooksSchema = Joi.object({
    notebookId: Joi.objectId().required(),
    name: Joi.string(),
    description: Joi.string(),
});

const trashNotebookSchema = Joi.object({
    notebookId: Joi.objectId().required(),
});

const restoreNotebookSchema = Joi.object({
    notebookId: Joi.objectId().required(),
});

const deleteNotebookSchema = Joi.object({
    notebookId: Joi.objectId().required(),
});


module.exports = {
    getNotebooksSchema,
    getNotebookSchema,
    createNotebooksSchema,
    updateNotebooksSchema,
    trashNotebookSchema,
    restoreNotebookSchema,
    deleteNotebookSchema
}