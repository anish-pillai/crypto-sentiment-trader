import { Router } from 'express';
import { sentimentService } from '../services/sentimentService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sentiment = await sentimentService.analyzeSentiment();
    res.json(sentiment);
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const sentimentRouter = router;