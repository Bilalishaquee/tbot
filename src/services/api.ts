import { MarketData, SignalData, PerformanceMetric } from '../types';
import { SMA, RSI, MACD } from 'technicalindicators';

const ALPHA_VANTAGE_API_KEY = '4W9YGF4L6D86Z4K3';
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch current exchange rate data for a currency pair
 */
export const getMarketData = async (pair: string): Promise<MarketData> => {
  const fromCurrency = pair.slice(0, 3).toUpperCase();
  const toCurrency = pair.slice(3, 6).toUpperCase();
  
  const response = await fetch(
    `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (!data['Realtime Currency Exchange Rate']) {
    throw new Error('Failed to fetch real-time exchange rate');
  }
  
  const rate = data['Realtime Currency Exchange Rate'];
  const price = parseFloat(rate['5. Exchange Rate']);
  const timestamp = new Date(rate['6. Last Refreshed']).getTime();
  
  return {
    pair,
    price,
    high: price,
    low: price,
    open: price,
    close: price,
    timestamp,
    volume: 0
  };
};

/**
 * Fetch historical market data for a currency pair
 */
export const getHistoricalData = async (pair: string, timeframe: number): Promise<MarketData[]> => {
  const fromCurrency = pair.slice(0, 3).toUpperCase();
  const toCurrency = pair.slice(3, 6).toUpperCase();

  // Get intraday data with 1min intervals for accurate signals
  const response = await fetch(
    `${BASE_URL}?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`
  );

  const data = await response.json();
  const timeSeries = data['Time Series FX (1min)'];

  if (!timeSeries) {
    throw new Error('Failed to fetch historical data');
  }

  return Object.entries(timeSeries)
    .slice(0, timeframe * 5) // Get enough data points for technical analysis
    .map(([time, values]: [string, any]) => ({
      pair,
      price: parseFloat(values['4. close']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      open: parseFloat(values['1. open']),
      close: parseFloat(values['4. close']),
      timestamp: new Date(time).getTime(),
      volume: 0
    }))
    .reverse(); // Most recent data first
};

/**
 * Generate trading signal based on technical indicators
 */
export const generateSignal = async (pair: string, timeframe: number): Promise<SignalData> => {
  const historicalData = await getHistoricalData(pair, timeframe);
  const prices = historicalData.map(d => d.close);
  
  // Calculate technical indicators
  const smaShort = SMA.calculate({ period: 10, values: prices });
  const smaLong = SMA.calculate({ period: 20, values: prices });
  const rsi = RSI.calculate({ period: 14, values: prices });
  const macd = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    values: prices
  });
  
  const lastPrice = prices[prices.length - 1];
  const lastSMAShort = smaShort[smaShort.length - 1];
  const lastSMALong = smaLong[smaLong.length - 1];
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macd[macd.length - 1];
  
  let direction: 'buy' | 'sell' | 'neutral' = 'neutral';
  let confidence = 0;
  
  // Trading logic based on multiple indicators
  if (lastSMAShort > lastSMALong && lastRSI < 70 && lastMACD.histogram > 0) {
    direction = 'buy';
    confidence = Math.min(
      ((70 - lastRSI) / 30) * 0.4 + // RSI weight
      (lastMACD.histogram / Math.abs(lastMACD.histogram)) * 0.3 + // MACD weight
      ((lastSMAShort - lastSMALong) / lastSMALong) * 0.3, // SMA weight
      1
    );
  } else if (lastSMAShort < lastSMALong && lastRSI > 30 && lastMACD.histogram < 0) {
    direction = 'sell';
    confidence = Math.min(
      ((lastRSI - 30) / 30) * 0.4 + // RSI weight
      (Math.abs(lastMACD.histogram) / lastMACD.histogram) * 0.3 + // MACD weight
      ((lastSMALong - lastSMAShort) / lastSMALong) * 0.3, // SMA weight
      1
    );
  }
  
  return {
    pair,
    timeframe,
    direction,
    confidence,
    timestamp: Date.now(),
    price: lastPrice,
    expiryTime: Date.now() + (timeframe * 60 * 1000) // Signal expires after timeframe
  };
};

/**
 * Get performance metrics based on historical signals
 */
export const getPerformanceMetrics = async (pair: string, timeframe: number): Promise<PerformanceMetric> => {
  const historicalData = await getHistoricalData(pair, timeframe * 2); // Get double the timeframe for backtesting
  let totalSignals = 0;
  let successfulSignals = 0;
  
  // Simple backtesting
  for (let i = 0; i < historicalData.length - timeframe; i++) {
    const testData = historicalData.slice(i, i + timeframe);
    const prices = testData.map(d => d.close);
    
    const sma = SMA.calculate({ period: 14, values: prices });
    const rsi = RSI.calculate({ period: 14, values: prices });
    const macd = MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices
    });
    
    if (sma.length > 0 && rsi.length > 0 && macd.length > 0) {
      const signal = macd[macd.length - 1].histogram > 0 ? 'buy' : 'sell';
      const futurePrice = historicalData[i + timeframe]?.close;
      
      if (futurePrice) {
        totalSignals++;
        if ((signal === 'buy' && futurePrice > prices[prices.length - 1]) ||
            (signal === 'sell' && futurePrice < prices[prices.length - 1])) {
          successfulSignals++;
        }
      }
    }
  }
  
  return {
    pair,
    timeframe,
    winRate: successfulSignals / totalSignals,
    totalSignals,
    successfulSignals,
  };
};