const Joi = require('joi');

const contactSchema = Joi.object({
    C: Joi.array().items(
        Joi.object({
            P: Joi.string(),
            N: Joi.string(),
        }),
    ),
});

module.exports = { contactSchema }