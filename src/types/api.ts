export interface ExchangeCredentials {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  additionalFields?: Record<string, string>;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface ExchangeBalance {
  exchange: string;
  balances: Balance[];
  lastUpdated: string;
}

export interface SentimentData {
  score: number;
  trend: 'positive' | 'negative' | 'neutral';
  lastUpdated: string;
  sources?: {
    twitter: number;
    reddit: number;
  };
}

export interface TradingStats {
  totalTrades: number;
  successRate: number;
  profitLoss: number;
  activePositions: number;
}

export interface BacktestResult {
  positions: TradingPosition[];
  totalTrades: number;
  profitLoss: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface TradingPosition {
  id: string;
  symbol: string;
  type: 'long' | 'short' | 'close';
  entryPrice?: number;
  exitPrice?: number;
  size: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed';
  openTime?: string;
  closeTime?: string;
  unrealizedPnl?: number;
  orders?: {
    entry?: string;
    stopLoss?: string;
    takeProfit?: string;
    exit?: string;
  };
}
