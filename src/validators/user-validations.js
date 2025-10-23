const { body} = require('express-validator');
const isStrongPassword = value => {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regex.test(value)) {
    throw new Error('Password must be at least 8 characters, include a number and an uppercase letter');
  }
  return true;
};
exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Email must be valid'),

  body('firstname')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('lastname')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),

 body('password').custom(isStrongPassword),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
  
];
exports.loginValidators = [
  body('email')
    .isEmail().withMessage('Email must be valid'),


  body('password')
    .notEmpty().withMessage('Password is required')
];
