import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exchangeRouter } from './routes/exchange';
import { sentimentRouter } from './routes/sentiment';
import { tradingRouter } from './routes/trading';
import { backtestRouter } from './routes/backtest';
import { paperTradingRouter } from './routes/paperTrading';
import { configRouter } from './routes/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/exchange', exchangeRouter);
app.use('/api/sentiment', sentimentRouter);
app.use('/api/trading', tradingRouter);
app.use('/api/backtest', backtestRouter);
app.use('/api/paper', paperTradingRouter);
app.use('/api/config', configRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});