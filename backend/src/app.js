import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ingestionRouter from './routes/ingestion.js';
import chatRouter from './routes/chat.js';
import stripeRouter from './routes/stripe.js';

const app = express();

app.use(helmet());[cite: 1]
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',[cite: 1]
    'https://ai-support-platform-topaz.vercel.app' // ADDED: Your live Vercel domain
  ],
  credentials: true,[cite: 1]
}));
app.use(morgan('dev'));[cite: 1]

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));[cite: 1]
app.use(express.json());[cite: 1]
app.use(express.urlencoded({ extended: true }));[cite: 1]

// Temporarily removed clerkAuth to isolate 500 error[cite: 1]

app.get('/health', (req, res) => {[cite: 1]
  res.json({ status: 'ok', timestamp: new Date().toISOString() });[cite: 1]
});[cite: 1]

app.use('/api/ingest', ingestionRouter);[cite: 1]
app.use('/api/chat', chatRouter);[cite: 1]
app.use('/api/stripe', stripeRouter);[cite: 1]

app.use((req, res) => {[cite: 1]
  res.status(404).json({ error: 'Route not found' });[cite: 1]
});[cite: 1]

export default app;[cite: 1]