const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const faqRoutes = require('./routes/faqRoutes');
const courseResourceRoutes = require('./routes/courseResourceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recordedClassRoutes = require('./routes/recordedClassRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const swaggerSpec = require('./config/swagger');

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: configuredOrigins.length ? configuredOrigins : true,
    credentials: true,
  })
);

app.use(express.json());

app.use(globalLimiter);

app.get('/', (req, res) => {
  res.send('LMS backend API is running');
});

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authLimiter, authRoutes);
app.use('/api', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', faqRoutes);
app.use('/api', courseResourceRoutes);
app.use('/api', reviewRoutes);
app.use('/api', recordedClassRoutes);
app.use('/api', liveClassRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', announcementRoutes);

app.use(errorHandler);

module.exports = app;