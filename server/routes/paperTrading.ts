import { Router } from 'express';
import { paperTradingService } from '../services/paperTradingService';
import { tradingSignalService } from '../services/tradingSignalService';

const router = Router();

// Demo user ID for paper trading
const DEMO_USER_ID = 'demo-user';

router.post('/trade', async (req, res) => {
  try {
    const { symbol } = req.body;

    // Get current trading signal
    const signal = await tradingSignalService.generateSignals(symbol);
    
    // Execute paper trade
    const position = await paperTradingService.executeTrade(
      DEMO_USER_ID,
      symbol,
      signal,
      signal.price
    );

    res.json({ success: true, position });
  } catch (error: any) {
    console.error('Paper trading error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to execute paper trade',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/account', (req, res) => {
  const summary = paperTradingService.getAccountSummary(DEMO_USER_ID);
  if (!summary) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json(summary);
});

export const paperTradingRouter = router;