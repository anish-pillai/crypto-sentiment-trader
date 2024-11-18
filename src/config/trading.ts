export interface TradingConfig {
  // Position sizing
  maxPositionSize: number;  // Percentage of balance (0-1)
  minPositionSize: number;  // Minimum position size in USD
  maxOpenPositions: number;

  // Risk management
  stopLossPercentage: number;  // Default stop loss (0-1)
  takeProfitPercentage: number;  // Default take profit (0-1)
  minimumConfidence: number;  // Minimum confidence for trade execution (0-1)

  // Sentiment analysis
  sentimentThreshold: number;  // Threshold for trade signals (-1 to 1)
  sentimentPeriod: number;  // Hours of sentiment data to consider

  // Paper trading
  paperTradingInitialBalance: number;  // Initial balance for paper trading in USD

  // Technical analysis
  smaShortPeriod: number;  // Short-term SMA period
  smaLongPeriod: number;   // Long-term SMA period
}

export const defaultConfig: TradingConfig = {
  maxPositionSize: 0.1,
  minPositionSize: 10,
  maxOpenPositions: 3,
  stopLossPercentage: 0.02,
  takeProfitPercentage: 0.05,
  minimumConfidence: 0.7,
  sentimentThreshold: 0.3,
  sentimentPeriod: 24,
  paperTradingInitialBalance: 10000,
  smaShortPeriod: 7,
  smaLongPeriod: 25
};