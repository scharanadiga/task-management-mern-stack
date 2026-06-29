const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const createRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO date'),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO date'),
];

const listRules = [
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status filter'),
  query('sortBy')
    .optional()
    .isIn(['dueDate', 'priority', 'createdAt']).withMessage('sortBy must be dueDate, priority, or createdAt'),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

const idRule = [param('id').isMongoId().withMessage('Invalid task ID')];

router.post('/', validate(createRules), createTask);
router.get('/', validate(listRules), getTasks);
router.get('/:id', validate(idRule), getTask);
router.patch('/:id', validate(updateRules), updateTask);
router.delete('/:id', validate(idRule), deleteTask);

module.exports = router;
