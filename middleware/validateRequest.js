const logger = require('../startup/logging');
const dbDebugger = require('debug')('app:db');

const validateRequest = (schemas) => (req, res, next) => {
    const validations = ['params', 'query', 'body'].map((field) => {
        const schema = schemas[field];
        const value = req[field];

        if (schema) {
            const { error } = schema.validate(value); // Adjust to validate req.query or req.params as needed

            if (error) {
                return { error }
            }
        }

        return null;
    }).filter(validation => validation !== null);

    if (validations.length > 0) {
        logger.error(error.details[0]);
        dbDebugger(error.details[0].message);
        return res
            .status(400)
            .send({
                code: 'validation failed',
                message: error.details[0].message,
            });
    }
    next();
};

module.exports = { validateRequest };