const { body } = require('express-validator');

// Reusable validation rules
const emailValidation = body('email')
  .isEmail()
  .withMessage('Please include a valid email.');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long.');

module.exports = {
  emailValidation,
  passwordValidation,
};