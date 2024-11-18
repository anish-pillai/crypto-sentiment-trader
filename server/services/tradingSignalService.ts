import { SMA } from 'technicalindicators';
import { SentimentData, TradingSignal, SignalStrength } from '../types/api';
import { exchangeService } from './exchangeService';

class TradingSignalService {
  private readonly SENTIMENT_THRESHOLD = 0.3;
  private readonly PRICE_HISTORY_LENGTH = 24; // Hours
  private priceHistory: Map<string, number[]> = new Map();
  private lastSignal: Map<string, TradingSignal> = new Map();

  async generateSignals(sentiment: SentimentData, symbol: string = 'BTC/USDT'): Promise<TradingSignal> {
    try {
      // Get latest price and update history
      const price = await this.getLatestPrice(symbol);
      this.updatePriceHistory(symbol, price);

      // Calculate technical indicators
      const technicalSignal = await this.analyzeTechnicalIndicators(symbol);
      
      // Combine sentiment and technical analysis
      const signal = this.combineSignals(sentiment, technicalSignal, price);
      
      // Store last signal
      this.lastSignal.set(symbol, signal);
      
      return signal;
    } catch (error) {
      console.error('Error generating trading signals:', error);
      throw new Error('Failed to generate trading signals');
    }
  }

  private async getLatestPrice(symbol: string): Promise<number> {
    try {
      const ticker = await exchangeService.getTickerPrice(symbol);
      return ticker.last;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  private updatePriceHistory(symbol: string, price: number) {
    const history = this.priceHistory.get(symbol) || [];
    history.push(price);
    
    // Keep only last 24 hours
    if (history.length > this.PRICE_HISTORY_LENGTH) {
      history.shift();
    }
    
    this.priceHistory.set(symbol, history);
  }

  private async analyzeTechnicalIndicators(symbol: string): Promise<SignalStrength> {
    const prices = this.priceHistory.get(symbol) || [];
    if (prices.length < 2) return 'neutral';

    // Calculate SMAs
    const sma7 = SMA.calculate({ period: 7, values: prices });
    const sma25 = SMA.calculate({ period: 25, values: prices });

    // Get latest values
    const lastSMA7 = sma7[sma7.length - 1];
    const lastSMA25 = sma25[sma25.length - 1];
    const currentPrice = prices[prices.length - 1];

    // Determine signal strength based on moving averages
    if (currentPrice > lastSMA7 && lastSMA7 > lastSMA25) {
      return 'strong_buy';
    } else if (currentPrice > lastSMA7) {
      return 'buy';
    } else if (currentPrice < lastSMA7 && lastSMA7 < lastSMA25) {
      return 'strong_sell';
    } else if (currentPrice < lastSMA7) {
      return 'sell';
    }

    return 'neutral';
  }

  private combineSignals(
    sentiment: SentimentData,
    technicalSignal: SignalStrength,
    currentPrice: number
  ): TradingSignal {
    const sentimentScore = sentiment.score;
    const lastSignal = this.lastSignal.get('BTC/USDT');
    
    let signal: SignalStrength = 'neutral';
    let confidence = 0;

    // Combine sentiment and technical analysis
    if (sentimentScore > this.SENTIMENT_THRESHOLD && technicalSignal.includes('buy')) {
      signal = technicalSignal === 'strong_buy' ? 'strong_buy' : 'buy';
      confidence = Math.min(Math.abs(sentimentScore) + 0.3, 1);
    } else if (sentimentScore < -this.SENTIMENT_THRESHOLD && technicalSignal.includes('sell')) {
      signal = technicalSignal === 'strong_sell' ? 'strong_sell' : 'sell';
      confidence = Math.min(Math.abs(sentimentScore) + 0.3, 1);
    } else {
      signal = 'neutral';
      confidence = 0.5;
    }

    // Risk management: Prevent rapid signal changes
    if (lastSignal && lastSignal.timestamp > Date.now() - 3600000) { // 1 hour
      if (lastSignal.signal !== signal && lastSignal.confidence > 0.8) {
        signal = lastSignal.signal;
        confidence = Math.max(0.6, lastSignal.confidence - 0.1);
      }
    }

    return {
      signal,
      confidence,
      price: currentPrice,
      timestamp: Date.now(),
      sentimentScore,
      technicalSignal
    };
  }
}

export const tradingSignalService = new TradingSignalService();