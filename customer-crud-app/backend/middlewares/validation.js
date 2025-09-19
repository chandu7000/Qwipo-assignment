const Joi = require('joi');

const customerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().pattern(/^\d{10}$/).required(),
  email: Joi.string().trim().email().allow('', null),
});

const addressSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  line1: Joi.string().trim().min(1).required(),
  line2: Joi.string().trim().allow('', null),
  city: Joi.string().trim().min(1).required(),
  state: Joi.string().trim().min(1).required(),
  country: Joi.string().trim().default('India'),
  pincode: Joi.string().trim().pattern(/^\d{6}$/).required(),
  isPrimary: Joi.boolean().default(false),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: 'Validation failed', details: error.details });
    }
    req.body = value;
    next();
  };
}

module.exports = { customerSchema, addressSchema, validate };


