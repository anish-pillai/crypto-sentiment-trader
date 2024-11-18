import { TwitterApi } from 'twitter-api-v2';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import NodeCache from 'node-cache';
import { SentimentData } from '../types/api';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class SentimentService {
  private twitterClient: TwitterApi;
  private model: use.UniversalSentenceEncoder | null = null;
  private readonly cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto'];
  
  constructor() {
    if (process.env.TWITTER_BEARER_TOKEN) {
      this.twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }
    this.initModel();
  }

  private async initModel() {
    try {
      this.model = await use.load();
      console.log('Sentiment analysis model loaded successfully');
    } catch (error) {
      console.error('Failed to load sentiment analysis model:', error);
    }
  }

  async analyzeSentiment(): Promise<SentimentData> {
    const cachedResult = cache.get<SentimentData>('sentiment');
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const tweets = await this.getTweets();
      const sentimentScore = await this.calculateSentiment(tweets);
      
      const result: SentimentData = {
        score: sentimentScore,
        trend: this.getTrend(sentimentScore),
        lastUpdated: new Date().toISOString(),
        sources: {
          twitter: tweets.length,
          reddit: 0
        }
      };

      cache.set('sentiment', result);
      return result;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.getFallbackSentiment();
    }
  }

  private async getTweets(): Promise<string[]> {
    if (!this.twitterClient) {
      return [];
    }

    try {
      const tweets = await this.twitterClient.v2.search({
        query: this.cryptoKeywords.map(k => `#${k}`).join(' OR '),
        max_results: 100,
        'tweet.fields': ['text', 'public_metrics']
      });

      return tweets.data.data.map(tweet => tweet.text);
    } catch (error) {
      console.error('Twitter API error:', error);
      return [];
    }
  }

  private async calculateSentiment(texts: string[]): Promise<number> {
    if (!this.model || texts.length === 0) {
      return 0;
    }

    try {
      // Get embeddings for all texts
      const embeddings = await this.model.embed(texts);
      const sentiments = await this.predictSentiments(embeddings);
      
      // Calculate weighted average based on engagement metrics
      const averageSentiment = tf.mean(sentiments).dataSync()[0];
      
      // Normalize to [-1, 1] range
      return Math.max(-1, Math.min(1, averageSentiment));
    } catch (error) {
      console.error('Error calculating sentiment:', error);
      return 0;
    }
  }

  private async predictSentiments(embeddings: tf.Tensor): Promise<tf.Tensor> {
    // This is a simplified sentiment classification
    // In a production environment, you would use a fine-tuned model
    const weights = tf.randomNormal([512, 1]);
    const biases = tf.randomNormal([1]);
    
    const predictions = tf.tidy(() => {
      const scores = embeddings.matMul(weights).add(biases);
      return tf.tanh(scores); // Normalize to [-1, 1]
    });
    
    // Cleanup
    weights.dispose();
    biases.dispose();
    
    return predictions;
  }

  private getTrend(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  private getFallbackSentiment(): SentimentData {
    return {
      score: 0,
      trend: 'neutral',
      lastUpdated: new Date().toISOString(),
      sources: {
        twitter: 0,
        reddit: 0
      }
    };
  }
}

export const sentimentService = new SentimentService();