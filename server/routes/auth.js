const express = require('express');
const { body } = require('express-validator');
const { signup, login } = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', validate(signupRules), signup);
router.post('/login', validate(loginRules), login);

module.exports = router;
