import { Router } from 'express';
import { backtestService } from '../services/backtestService';
import { sentimentService } from '../services/sentimentService';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    const { symbol, startDate, endDate } = req.body;

    // Validate inputs
    if (!symbol || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get historical sentiment data
    const sentimentData = await sentimentService.getHistoricalSentiment(
      new Date(startDate),
      new Date(endDate)
    );

    // Run backtest
    const results = await backtestService.runBacktest(
      symbol,
      new Date(startDate),
      new Date(endDate),
      sentimentData
    );

    res.json(results);
  } catch (error: any) {
    console.error('Backtest error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to run backtest',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export const backtestRouter = router;