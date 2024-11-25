import { TwitterApi } from 'twitter-api-v2';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import NodeCache from 'node-cache';
import { SentimentData } from '../types/api';
import fetch from 'node-fetch';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class SentimentService {
  private twitterClient: TwitterApi;
  private model: use.UniversalSentenceEncoder | null = null;
  private readonly cryptoKeywords = [
    'bitcoin',
    'btc',
    'ethereum',
    'eth',
    'crypto',
  ];

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
      const [tweets, redditPosts] = await Promise.all([
        this.getTweets(),
        this.getRedditPosts(),
      ]);
      const sentimentScore = await this.calculateSentiment([
        ...tweets,
        ...redditPosts,
      ]);

      const result: SentimentData = {
        score: sentimentScore,
        trend: this.getTrend(sentimentScore),
        lastUpdated: new Date().toISOString(),
        sources: {
          twitter: tweets.length,
          reddit: redditPosts.length,
        },
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
      const tweets = await this.twitterClient.v2.search(
        'crypto OR bitcoin OR ethereum',
        {
          'tweet.fields': 'created_at',
          max_results: 100,
        }
      );
      if (Array.isArray(tweets.data)) {
        return tweets.data.map((tweet) => tweet.text);
      } else {
        console.error(
          'Expected tweets.data to be an array, but got:',
          tweets.data
        );
        return [];
      }
    } catch (error) {
      if (error.code === 429) {
        const resetTime = error.rateLimit.reset * 1000;
        const waitTime = resetTime - Date.now();
        console.warn(
          `Twitter Rate limit exceeded. Retrying in ${
            waitTime / 1000
          } seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.getTweets();
      } else {
        console.error('Twitter API error:', error);
        return [];
      }
    }
  }

  private async getRedditPosts(): Promise<string[]> {
    try {
      const response = await fetch(
        'https://www.reddit.com/r/cryptocurrency/new.json?limit=100'
      );
      const data = await response.json();
      return data.data.children.map((post) => post.data.title);
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
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
  private async predictSentiments(embeddings: tf.Tensor2D): Promise<tf.Tensor> {
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
        reddit: 0,
      },
    };
  }
}

export const sentimentService = new SentimentService();
