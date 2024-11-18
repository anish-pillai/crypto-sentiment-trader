import { Router } from 'express';
import { exchangeService } from '../services/exchangeService';
import { sessionService } from '../services/sessionService';

const router = Router();

// Middleware to ensure valid session
const requireSession = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessionService.validateSession(sessionId)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  req.sessionId = sessionId;
  next();
};

// Initialize session
router.post('/session', (req, res) => {
  const sessionId = sessionService.createSession();
  res.json({ sessionId });
});

router.post('/connect', requireSession, async (req, res) => {
  try {
    if (!req.body.apiKey || !req.body.apiSecret || !req.body.exchange) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'API key, secret, and exchange name are required',
      });
    }

    await exchangeService.connectExchange(req.sessionId, req.body);
    res.status(200).json({ message: 'Exchange connected successfully' });
  } catch (error: any) {
    console.error('Exchange connection error:', error);
    res.status(400).json({
      error: error.message || 'Failed to connect to exchange',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

router.get('/balances/:exchange', requireSession, async (req, res) => {
  try {
    const balances = await exchangeService.getBalances(
      req.sessionId,
      req.params.exchange
    );
    res.json(balances);
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    res.status(400).json({
      error: error.message || 'Failed to fetch balances',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

router.delete('/:exchange', requireSession, (req, res) => {
  try {
    exchangeService.disconnectExchange(req.sessionId, req.params.exchange);
    res.status(200).json({ message: 'Exchange disconnected successfully' });
  } catch (error: any) {
    console.error('Exchange disconnection error:', error);
    res
      .status(400)
      .json({ error: error.message || 'Failed to disconnect exchange' });
  }
});

export const exchangeRouter = router;
