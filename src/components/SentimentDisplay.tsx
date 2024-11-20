import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export const SentimentDisplay: React.FC = () => {
  const sentimentData = useStore((state) => state.sentimentData);
  const fetchSentimentData = useStore((state) => state.fetchSentimentData);

  useEffect(() => {
    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, [fetchSentimentData]);

  const getTrendIcon = () => {
    switch (sentimentData.trend) {
      case 'positive':
        return (
          <TrendingUp className='h-6 w-6 text-green-500 dark:text-green-400' />
        );
      case 'negative':
        return (
          <TrendingDown className='h-6 w-6 text-red-500 dark:text-red-400' />
        );
      default:
        return <Minus className='h-6 w-6 text-gray-500 dark:text-gray-400' />;
    }
  };

  const getBackgroundColor = () => {
    switch (sentimentData.trend) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 transition-colors duration-200 ${getBackgroundColor()}`}
    >
      <h2 className='text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white'>
        Market Sentiment
        {getTrendIcon()}
      </h2>
      <div className='space-y-4'>
        <div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Sentiment Score
          </p>
          <p className='text-3xl font-bold text-gray-900 dark:text-white'>
            {sentimentData.score.toFixed(2)}
          </p>
        </div>
        <div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Last Updated
          </p>
          <p className='text-sm text-gray-900 dark:text-white'>
            {new Date(sentimentData.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
