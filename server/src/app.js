import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { trackIP } from './middleware/trackIP.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import withdrawalRoutes from './routes/withdrawals.js';
import userRoutes from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 200 : 1000);
const limiter = rateLimit({
  windowMs: rateLimitWindow,
  max: rateLimitMax,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(trackIP);
// CORS: allow frontend origin. Set CLIENT_URL on Render (e.g. https://client-earn.onrender.com).
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin or tools that don't send Origin
      if (origin === allowedOrigin) return callback(null, true);
      // On Render, if CLIENT_URL is not set, allow any *.onrender.com so same-origin works
      if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL && origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// In production, serve the React app (built files in server/public)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

export default app;
