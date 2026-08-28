import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import ticketRoutes from './routes/ticket.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Security rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Flexible CORS policy for local dev and Vercel hosting
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('vercel.app') ||
        origin === env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check & Root endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 EventHub API Server is active and operational',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'API Operational', timestamp: new Date().toISOString() });
});

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'EventHub API v1 Base Route',
    endpoints: ['/auth', '/events', '/bookings', '/tickets', '/admin'],
  });
});

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);

// Stripe Webhook Endpoint (Direct response confirmation simulator)
app.post('/api/v1/webhooks/stripe', (req, res) => {
  console.log('[Stripe Webhook]: Event received successfully.');
  res.json({ received: true });
});

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 EventHub API Server running at http://localhost:${PORT}`);
});
