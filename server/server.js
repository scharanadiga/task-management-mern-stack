require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./utils/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
