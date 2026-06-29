const Task = require('../models/Task');

const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.status(201).json(formatTask(task));
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const {
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const validSortFields = ['dueDate', 'priority', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = order === 'asc' ? 1 : -1;

    let tasks;
    let total;

    if (sortField === 'priority') {
      // priority is an enum string so sort in application layer
      [tasks, total] = await Promise.all([
        Task.find(filter).sort({ createdAt: -1 }),
        Task.countDocuments(filter),
      ]);

      tasks.sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return sortDir === 1 ? diff : -diff;
      });

      tasks = tasks.slice(skip, skip + limitNum);
    } else {
      const sort = { [sortField]: sortDir };
      // Put null dueDates at the end regardless of order
      if (sortField === 'dueDate') sort._id = -1;

      [tasks, total] = await Promise.all([
        Task.find(filter).sort(sort).skip(skip).limit(limitNum),
        Task.countDocuments(filter),
      ]);
    }

    res.status(200).json({
      tasks: tasks.map(formatTask),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return notFound(res);

    res.status(200).json(formatTask(task));
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'dueDate' ? new Date(req.body[field]) : req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'No valid fields provided for update' },
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) return notFound(res);

    res.status(200).json(formatTask(task));
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) return notFound(res);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

function formatTask(task) {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function notFound(res) {
  return res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Task not found' },
  });
}
