import NodeCache from 'node-cache';
import { TradingConfig, defaultConfig } from '../../src/config/trading';

class ConfigService {
  private configs: NodeCache;

  constructor() {
    this.configs = new NodeCache({ stdTTL: 0 }); // No expiration
  }

  getConfig(userId: string): TradingConfig {
    return this.configs.get(userId) || defaultConfig;
  }

  updateConfig(userId: string, config: TradingConfig): void {
    // Validate config values
    this.validateConfig(config);
    this.configs.set(userId, config);
  }

  private validateConfig(config: TradingConfig): void {
    if (config.maxPositionSize <= 0 || config.maxPositionSize > 1) {
      throw new Error('Max position size must be between 0 and 1');
    }
    if (config.minPositionSize < 1) {
      throw new Error('Minimum position size must be at least 1 USD');
    }
    if (config.maxOpenPositions < 1) {
      throw new Error('Maximum open positions must be at least 1');
    }
    if (config.stopLossPercentage <= 0 || config.stopLossPercentage > 0.5) {
      throw new Error('Stop loss percentage must be between 0 and 0.5');
    }
    if (config.takeProfitPercentage <= 0 || config.takeProfitPercentage > 1) {
      throw new Error('Take profit percentage must be between 0 and 1');
    }
    if (config.minimumConfidence < 0.5 || config.minimumConfidence > 1) {
      throw new Error('Minimum confidence must be between 0.5 and 1');
    }
    if (config.sentimentThreshold <= 0 || config.sentimentThreshold > 1) {
      throw new Error('Sentiment threshold must be between 0 and 1');
    }
    if (config.sentimentPeriod < 1 || config.sentimentPeriod > 72) {
      throw new Error('Sentiment period must be between 1 and 72 hours');
    }
    if (config.paperTradingInitialBalance < 1000) {
      throw new Error('Paper trading initial balance must be at least 1000 USD');
    }
    if (config.smaShortPeriod < 2 || config.smaShortPeriod >= config.smaLongPeriod) {
      throw new Error('Short SMA period must be at least 2 and less than long period');
    }
    if (config.smaLongPeriod < 5 || config.smaLongPeriod > 200) {
      throw new Error('Long SMA period must be between 5 and 200');
    }
  }
}

export const configService = new ConfigService();