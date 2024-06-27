import Joi from 'joi';
Joi.objectId = require('joi-objectid')(Joi);

const getKhataSchema = Joi.object({
    lastUpdatedTimeStamp: Joi.date().timestamp('unix'),
    pageSize: Joi.number().integer().max(10000),
    pageNumber: Joi.number().integer(),
});

const khataSchema = Joi.object({
    friendName: Joi.string().min(1).required(),
    friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        })
        .required(),
    interestRate: Joi.number().min(0).max(100),
    interestType: Joi.string().valid('N', 'CY', 'CW', 'CM').required(),
    rotationPeriod: Joi.string().valid('0M', '3M', '6M', '18M', '1Y', '2Y'),
    localId: Joi.string().required(),
    settledFlag: Joi.boolean(),
});

const khataArraySchema = Joi.array().items(
    Joi.object({
        friendName: Joi.string().min(1).required(),
        friendPhoneNumber: Joi.string()
            .regex(/^[0-9]{10}$/)
            .messages({
                'string.pattern.base': `Phone number must have 10 digits.`,
            })
            .required(),
        interestRate: Joi.number().required().min(0).max(100).required(),
        interestType: Joi.string().valid('N', 'CY', 'CW', 'CM').required(),
        rotationPeriod: Joi.string()
            .valid('3M', '6M', '1Y', '2Y')
            .required(),
        localId: Joi.string().required(),
        settledFlag: Joi.boolean(),
    }),
);

const updateKhataSchema = Joi.object({
    khataId: Joi.objectId().required(),
    friendName: Joi.string().min(1),
    friendPhoneNumber: Joi.string()
        .regex(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': `Phone number must have 10 digits.`,
        }),
    interestRate: Joi.number().min(0).max(100),
    interestType: Joi.string().valid('S', 'N', 'CY', 'CW', 'CM'),
    rotationPeriod: Joi.string().valid('3M', '6M', '1Y', '2Y'),
    settledFlag: Joi.boolean().valid(true),
});


const unsettleKhataSchema = Joi.object({
    khataIds: Joi.array().items(Joi.objectId().required()),
});


const updateSettleKhataSchema = Joi.object({
    khataObjects: Joi.array()
        .items(
            Joi.object({
                id: Joi.objectId().required(),
                interest: Joi.number().required(), // Add validation for the interest field
            }),
        )
        .required(),
});

module.exports = {
    getKhataSchema,
    khataSchema,
    khataArraySchema,
    updateKhataSchema,
    unsettleKhataSchema,
    updateSettleKhataSchema
};
