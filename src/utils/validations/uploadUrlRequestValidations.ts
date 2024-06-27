import Joi from 'joi';

const uploadUrlRequestSchema = Joi.object({
    count: Joi.number().integer().max(4).min(1),
});

module.exports = {
    uploadUrlRequestSchema: uploadUrlRequestSchema
};