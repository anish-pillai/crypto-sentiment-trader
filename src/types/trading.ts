export type SignalStrength = 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';

export interface TradingSignal {
  signal: SignalStrength;
  confidence: number;
  price: number;
  timestamp: number;
  sentimentScore: number;
  technicalSignal: SignalStrength;
}