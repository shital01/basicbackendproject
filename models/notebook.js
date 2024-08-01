const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const mongoose = require('mongoose');


const NotebookSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 64,
    },
    description: {
        type: String,
        minLength: 1,
        maxLength: 256,
    },
    trashFlag: {
        type: Boolean,
        default: false,
    },
    deleteFlag: {
        type: Boolean,
        default: false,
    },
    createdTimeStamp: {
        type: Number,
        required: true,
        default: function () {
            return Date.now();
        },
    },
    updatedTimeStamp: {
        type: Number,
        required: true,
        default: function () {
            return Date.now();
        },
    },
});

const Notebook = mongoose.model('Notebook', NotebookSchema);

module.exports = {
    Notebook,
}