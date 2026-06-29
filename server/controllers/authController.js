const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: { code: 'DUPLICATE_ERROR', message: 'Email already in use' },
      });
    }

    const user = await User.create({ name, email, password });
    const token = signToken({ id: user._id });

    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const token = signToken({ id: user._id });

    res.status(200).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};
