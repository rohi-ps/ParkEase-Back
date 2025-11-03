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

  body('firstName')
    .trim()
    .notEmpty().withMessage('Firstname is required')
    .isLength({ min: 3 }).withMessage('Firstname must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Firstname must contain only letters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Lastname is required')
    .isLength({ min: 3 }).withMessage('Lastname must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Lastname must contain only letters'),
  body('phone')
  .notEmpty().withMessage('Phone number is required')
  .isMobilePhone().withMessage('Phone number must be valid'),
  body('password').custom(isStrongPassword),
  body('confirmPassword').custom((value, { req }) => {
  const password = req.body.password;
  const confirm = req.body.confirmPassword || req.body.confirmpassword;
  if (confirm !== password) {
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
