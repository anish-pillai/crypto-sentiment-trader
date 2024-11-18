import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SignalStrength } from '../types/api';

export const TradingSignals: React.FC = () => {
  const { tradingSignal, sentimentData } = useStore();

  const getSignalColor = (signal: SignalStrength) => {
    switch (signal) {
      case 'strong_buy':
      case 'buy':
        return 'text-green-500 dark:text-green-400';
      case 'strong_sell':
      case 'sell':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getSignalIcon = (signal: SignalStrength) => {
    switch (signal) {
      case 'strong_buy':
      case 'buy':
        return <TrendingUp className="h-6 w-6" />;
      case 'strong_sell':
      case 'sell':
        return <TrendingDown className="h-6 w-6" />;
      default:
        return <Minus className="h-6 w-6" />;
    }
  };

  const getSignalText = (signal: SignalStrength) => {
    switch (signal) {
      case 'strong_buy':
        return 'Strong Buy';
      case 'buy':
        return 'Buy';
      case 'strong_sell':
        return 'Strong Sell';
      case 'sell':
        return 'Sell';
      default:
        return 'Neutral';
    }
  };

  if (!tradingSignal) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        Trading Signals
      </h2>

      <div className="space-y-6">
        {/* Current Signal */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Signal</p>
            <div className={`flex items-center gap-2 text-lg font-semibold ${getSignalColor(tradingSignal.signal)}`}>
              {getSignalIcon(tradingSignal.signal)}
              {getSignalText(tradingSignal.signal)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(tradingSignal.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Price Information */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${tradingSignal.price.toLocaleString()}
          </p>
        </div>

        {/* Analysis Components */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment</p>
            <p className={`text-lg font-semibold ${getSignalColor(tradingSignal.signal)}`}>
              {(sentimentData.score * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Technical</p>
            <p className={`text-lg font-semibold ${getSignalColor(tradingSignal.technicalSignal)}`}>
              {getSignalText(tradingSignal.technicalSignal)}
            </p>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <p>Trading signals are for informational purposes only. Always manage your risk carefully.</p>
        </div>
      </div>
    </div>
  );
};