import { Router } from 'express';
import { tradingService } from '../services/tradingService';
import { tradingSignalService } from '../services/tradingSignalService';

const router = Router();
const DEMO_USER_ID = 'demo-user';

router.post('/execute', async (req, res) => {
  try {
    const { exchange, symbol } = req.body;
    
    // Get latest trading signal
    const signal = await tradingSignalService.generateSignals(symbol);
    
    // Execute trade based on signal
    const position = await tradingService.executeTrade(
      DEMO_USER_ID,
      exchange,
      symbol,
      signal.signal,
      signal.confidence,
      signal.price
    );

    res.json({ success: true, position });
  } catch (error: any) {
    console.error('Trade execution error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to execute trade',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/positions/:exchange', async (req, res) => {
  try {
    const positions = await tradingService.getOpenPositions(
      DEMO_USER_ID,
      req.params.exchange
    );
    res.json(positions);
  } catch (error: any) {
    console.error('Error fetching positions:', error);
    res.status(400).json({ error: error.message });
  }
});

export const tradingRouter = router;