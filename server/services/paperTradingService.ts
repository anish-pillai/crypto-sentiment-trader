import { TradingPosition, TradingSignal, OrderType } from '../types/api';
import { tradingSignalService } from './tradingSignalService';
import NodeCache from 'node-cache';

interface PaperAccount {
  userId: string;
  balance: number;
  positions: TradingPosition[];
  trades: TradingPosition[];
}

class PaperTradingService {
  private accounts = new NodeCache({ stdTTL: 0 }); // No expiration
  private readonly INITIAL_BALANCE = 10000; // $10,000 USD

  initializeAccount(userId: string): PaperAccount {
    const account: PaperAccount = {
      userId,
      balance: this.INITIAL_BALANCE,
      positions: [],
      trades: []
    };
    
    this.accounts.set(userId, account);
    return account;
  }

  async executeTrade(
    userId: string,
    symbol: string,
    signal: TradingSignal,
    currentPrice: number
  ): Promise<TradingPosition | null> {
    try {
      let account = this.accounts.get<PaperAccount>(userId);
      if (!account) {
        account = this.initializeAccount(userId);
      }

      // Check if we should open a position
      if (this.shouldOpenPosition(signal, account.positions)) {
        const position = await this.openPosition(
          account,
          symbol,
          currentPrice
        );

        if (position) {
          account.positions.push(position);
          this.accounts.set(userId, account);
          return position;
        }
      }

      return null;
    } catch (error) {
      console.error('Paper trading error:', error);
      throw new Error('Failed to execute paper trade');
    }
  }

  async updatePositions(userId: string, currentPrice: number): Promise<void> {
    const account = this.accounts.get<PaperAccount>(userId);
    if (!account) return;

    const updatedPositions: TradingPosition[] = [];

    for (const position of account.positions) {
      if (position.status === 'closed') continue;

      // Check stop-loss
      if (currentPrice <= position.stopLoss!) {
        position.status = 'closed';
        position.exitPrice = position.stopLoss;
        position.closeTime = new Date().toISOString();
        account.trades.push(position);
        
        // Update balance
        account.balance += position.size * position.stopLoss;
        continue;
      }

      // Check take-profit
      if (currentPrice >= position.takeProfit!) {
        position.status = 'closed';
        position.exitPrice = position.takeProfit;
        position.closeTime = new Date().toISOString();
        account.trades.push(position);
        
        // Update balance
        account.balance += position.size * position.takeProfit;
        continue;
      }

      updatedPositions.push(position);
    }

    account.positions = updatedPositions;
    this.accounts.set(userId, account);
  }

  getAccountSummary(userId: string) {
    const account = this.accounts.get<PaperAccount>(userId);
    if (!account) return null;

    return {
      balance: account.balance,
      openPositions: account.positions.length,
      totalTrades: account.trades.length,
      profitLoss: account.balance - this.INITIAL_BALANCE,
      winRate: this.calculateWinRate(account.trades)
    };
  }

  private shouldOpenPosition(signal: TradingSignal, positions: TradingPosition[]): boolean {
    return (
      positions.length === 0 &&
      (signal.signal === 'strong_buy' || signal.signal === 'buy') &&
      signal.confidence >= 0.7
    );
  }

  private async openPosition(
    account: PaperAccount,
    symbol: string,
    currentPrice: number
  ): Promise<TradingPosition | null> {
    const positionSize = Math.min(account.balance * 0.1, account.balance); // Max 10% of balance
    
    if (positionSize < 10) { // Minimum position size $10
      return null;
    }

    // Deduct from balance
    account.balance -= positionSize;

    return {
      id: `paper_${Date.now()}`,
      symbol,
      type: 'long',
      entryPrice: currentPrice,
      size: positionSize / currentPrice,
      stopLoss: currentPrice * 0.98, // 2% stop loss
      takeProfit: currentPrice * 1.05, // 5% take profit
      status: 'open',
      openTime: new Date().toISOString()
    };
  }

  private calculateWinRate(trades: TradingPosition[]): number {
    if (trades.length === 0) return 0;
    
    const winningTrades = trades.filter(trade => {
      if (!trade.exitPrice || !trade.entryPrice) return false;
      return trade.exitPrice > trade.entryPrice;
    });

    return (winningTrades.length / trades.length) * 100;
  }
}

export const paperTradingService = new PaperTradingService();