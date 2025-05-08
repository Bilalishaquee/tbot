import { MarketData, SignalData, PerformanceMetric } from '../types';
import { MOCK_API_DELAY, FOREX_PAIRS } from '../utils/constants';

/**
 * Mock API service to simulate real API calls to Quotex
 * In a real implementation, this would be replaced with actual API calls
 */

// Helper functions for generating mock data
const getRandomPrice = (base: number, volatility: number): number => {
  return base + (Math.random() - 0.5) * volatility;
};

const getRandomDirection = (): 'buy' | 'sell' | 'neutral' => {
  const rand = Math.random();
  if (rand > 0.6) return 'buy';
  if (rand > 0.2) return 'sell';
  return 'neutral';
};

// Base prices for different pairs (mock data)
const basePrices: Record<string, number> = {
  'eurusd': 1.0876,
  'usdjpy': 149.24,
  'gbpusd': 1.2534,
  'usdcad': 1.3645,
  'audusd': 0.6532,
  'nzdusd': 0.5978,
  'usdchf': 0.9034,
  'eurjpy': 162.31,
  'eurgbp': 0.8675,
  'gbpjpy': 187.23,
};

// Simulated volatility for each pair (for realistic price movements)
const volatility: Record<string, number> = {
  'eurusd': 0.0005,
  'usdjpy': 0.05,
  'gbpusd': 0.0008,
  'usdcad': 0.0007,
  'audusd': 0.0006,
  'nzdusd': 0.0006,
  'usdchf': 0.0005,
  'eurjpy': 0.06,
  'eurgbp': 0.0004,
  'gbpjpy': 0.07,
};

/**
 * Get market data for a specific forex pair
 */
export const getMarketData = async (pair: string): Promise<MarketData> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const basePrice = basePrices[pair] || 1.0;
  const priceVolatility = volatility[pair] || 0.001;
  const currentPrice = getRandomPrice(basePrice, priceVolatility);
  
  return {
    pair,
    price: currentPrice,
    high: currentPrice * (1 + Math.random() * 0.001),
    low: currentPrice * (1 - Math.random() * 0.001),
    open: getRandomPrice(basePrice, priceVolatility),
    close: currentPrice,
    timestamp: Date.now(),
    volume: Math.floor(Math.random() * 1000) + 500,
  };
};

/**
 * Get historical market data for a specific forex pair and timeframe
 */
export const getHistoricalData = async (pair: string, timeframe: number, count: number = 20): Promise<MarketData[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const basePrice = basePrices[pair] || 1.0;
  const priceVolatility = volatility[pair] || 0.001;
  const data: MarketData[] = [];
  
  let lastPrice = basePrice;
  const now = Date.now();
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * timeframe * 60 * 1000);
    lastPrice = getRandomPrice(lastPrice, priceVolatility);
    
    const high = lastPrice * (1 + Math.random() * 0.001);
    const low = lastPrice * (1 - Math.random() * 0.001);
    
    data.push({
      pair,
      price: lastPrice,
      high,
      low,
      open: getRandomPrice(lastPrice, priceVolatility * 0.8),
      close: lastPrice,
      timestamp,
      volume: Math.floor(Math.random() * 1000) + 500,
    });
  }
  
  return data;
};

/**
 * Generate a trading signal for a specific pair and timeframe
 */
export const generateSignal = async (pair: string, timeframe: number): Promise<SignalData> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY * 1.5));
  
  const basePrice = basePrices[pair] || 1.0;
  const currentPrice = getRandomPrice(basePrice, volatility[pair] || 0.001);
  const direction = getRandomDirection();
  const confidence = Math.random() * 0.4 + 0.3; // Random between 0.3 and 0.7
  const now = Date.now();
  
  return {
    pair,
    timeframe,
    direction,
    confidence,
    timestamp: now,
    price: currentPrice,
    expiryTime: now + (timeframe * 60 * 1000), // Expiry after the selected timeframe
  };
};

/**
 * Get performance metrics for a specific pair and timeframe
 */
export const getPerformanceMetrics = async (pair: string, timeframe: number): Promise<PerformanceMetric> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const totalSignals = Math.floor(Math.random() * 100) + 50;
  const winRate = Math.random() * 0.3 + 0.55; // Random between 55% and 85%
  const successfulSignals = Math.floor(totalSignals * winRate);
  
  return {
    pair,
    timeframe,
    winRate,
    totalSignals,
    successfulSignals,
  };
};

/**
 * Get available forex pairs
 */
export const getAvailablePairs = async () => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2));
  return FOREX_PAIRS;
};