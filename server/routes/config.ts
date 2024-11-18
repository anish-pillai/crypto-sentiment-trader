import { Router } from 'express';
import { configService } from '../services/configService';

const router = Router();

// Demo user ID for configuration
const DEMO_USER_ID = 'demo-user';

router.get('/', (req, res) => {
  const config = configService.getConfig(DEMO_USER_ID);
  res.json(config);
});

router.post('/', (req, res) => {
  try {
    configService.updateConfig(DEMO_USER_ID, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export const configRouter = router;