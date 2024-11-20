import express from 'express';
import { sentimentService } from '../services/sentimentService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sentimentData = await sentimentService.analyzeSentiment();
    res.json(sentimentData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }
});

export default router;
