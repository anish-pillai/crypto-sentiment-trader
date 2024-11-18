import React from 'react';
import { Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TradingConfig } from '../config/trading';

export const ConfigurationPanel: React.FC = () => {
  const { config, updateConfig } = useStore();

  const handleChange = (key: keyof TradingConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateConfig({ ...config, [key]: numValue });
    }
  };

  const formatPercentage = (value: number) => (value * 100).toString();
  const parsePercentage = (value: string) => parseFloat(value) / 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Trading Configuration
      </h2>

      <div className="space-y-6">
        {/* Position Sizing */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Position Sizing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Position Size (%)
              </label>
              <input
                type="number"
                value={formatPercentage(config.maxPositionSize)}
                onChange={(e) => handleChange('maxPositionSize', parsePercentage(e.target.value).toString())}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Position Size (USD)
              </label>
              <input
                type="number"
                value={config.minPositionSize}
                onChange={(e) => handleChange('minPositionSize', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Open Positions
              </label>
              <input
                type="number"
                value={config.maxOpenPositions}
                onChange={(e) => handleChange('maxOpenPositions', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="10"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Risk Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stop Loss (%)
              </label>
              <input
                type="number"
                value={formatPercentage(config.stopLossPercentage)}
                onChange={(e) => handleChange('stopLossPercentage', parsePercentage(e.target.value).toString())}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0.1"
                max="20"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Take Profit (%)
              </label>
              <input
                type="number"
                value={formatPercentage(config.takeProfitPercentage)}
                onChange={(e) => handleChange('takeProfitPercentage', parsePercentage(e.target.value).toString())}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0.1"
                max="50"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Confidence (%)
              </label>
              <input
                type="number"
                value={formatPercentage(config.minimumConfidence)}
                onChange={(e) => handleChange('minimumConfidence', parsePercentage(e.target.value).toString())}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="50"
                max="100"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Sentiment Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sentiment Threshold
              </label>
              <input
                type="number"
                value={formatPercentage(config.sentimentThreshold)}
                onChange={(e) => handleChange('sentimentThreshold', parsePercentage(e.target.value).toString())}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="10"
                max="90"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Analysis Period (Hours)
              </label>
              <input
                type="number"
                value={config.sentimentPeriod}
                onChange={(e) => handleChange('sentimentPeriod', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="72"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Technical Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short SMA Period
              </label>
              <input
                type="number"
                value={config.smaShortPeriod}
                onChange={(e) => handleChange('smaShortPeriod', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="2"
                max="50"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long SMA Period
              </label>
              <input
                type="number"
                value={config.smaLongPeriod}
                onChange={(e) => handleChange('smaLongPeriod', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="5"
                max="200"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Paper Trading */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Paper Trading
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Balance (USD)
            </label>
            <input
              type="number"
              value={config.paperTradingInitialBalance}
              onChange={(e) => handleChange('paperTradingInitialBalance', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1000"
              step="1000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};