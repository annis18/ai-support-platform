import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ingestionRouter from './routes/ingestion.js';
import chatRouter from './routes/chat.js';
import stripeRouter from './routes/stripe.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(morgan('dev'));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporarily removed clerkAuth to isolate 500 error

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/ingest', ingestionRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stripe', stripeRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;