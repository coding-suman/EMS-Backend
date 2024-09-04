const Joi = require('joi');

// Define a schema for user registration
const registerValidationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must not exceed 30 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

const convertUTCToIST = (date) => {
  if (!date) return null; // Handle cases where the date is not defined

  const utcDate = new Date(date);
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const istDate = new Date(utcDate.getTime() + istOffset);
  return istDate;
};


module.exports = { registerValidationSchema, convertUTCToIST };
