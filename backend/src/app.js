import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ingestionRouter from './routes/ingestion.js';
import chatRouter from './routes/chat.js';
import stripeRouter from './routes/stripe.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ai-support-platform-topaz.vercel.app',
  ],
  credentials: true,
}));

app.use(morgan('dev'));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ingest', ingestionRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;