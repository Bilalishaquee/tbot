import { MarketData, SignalData, PerformanceMetric } from '../types';
import { SMA, RSI, MACD } from 'technicalindicators';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '4W9YGF4L6D86Z4K3';
const BASE_URL = 'https://www.alphavantage.co/query';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for API limit message
    if (data['Note']?.includes('API call frequency')) {
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error('API rate limit reached. Please try again later.');
    }
    
    // Check for error messages
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

/**
 * Fetch current exchange rate data for a currency pair
 */
export const getMarketData = async (pair: string): Promise<MarketData> => {
  try {
    const fromCurrency = pair.slice(0, 3).toUpperCase();
    const toCurrency = pair.slice(3, 6).toUpperCase();
    
    const response = await fetchWithRetry(
      `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data['Realtime Currency Exchange Rate']) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid API response format');
    }
    
    const rate = data['Realtime Currency Exchange Rate'];
    const price = parseFloat(rate['5. Exchange Rate']);
    const timestamp = new Date(rate['6. Last Refreshed']).getTime();
    
    if (isNaN(price)) {
      throw new Error('Invalid price data received');
    }
    
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
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch real-time exchange rate');
  }
};

/**
 * Fetch historical market data for a currency pair
 */
export const getHistoricalData = async (pair: string, timeframe: number): Promise<MarketData[]> => {
  try {
    const fromCurrency = pair.slice(0, 3).toUpperCase();
    const toCurrency = pair.slice(3, 6).toUpperCase();

    const response = await fetchWithRetry(
      `${BASE_URL}?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=1min&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`
    );

    const data = await response.json();
    const timeSeries = data['Time Series FX (1min)'];

    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      console.error('Invalid historical data response:', data);
      throw new Error('Invalid historical data format');
    }

    return Object.entries(timeSeries)
      .slice(0, timeframe * 5)
      .map(([time, values]: [string, any]) => {
        const marketData = {
          pair,
          price: parseFloat(values['4. close']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          open: parseFloat(values['1. open']),
          close: parseFloat(values['4. close']),
          timestamp: new Date(time).getTime(),
          volume: 0
        };

        // Validate the parsed data
        if (Object.values(marketData).some(val => 
          (typeof val === 'number' && isNaN(val)) || 
          (typeof val === 'number' && !isFinite(val))
        )) {
          throw new Error('Invalid numerical data in API response');
        }

        return marketData;
      })
      .reverse();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw new Error('Failed to fetch historical data');
  }
};

/**
 * Generate trading signal based on technical indicators
 */
export const generateSignal = async (pair: string, timeframe: number): Promise<SignalData> => {
  try {
    const historicalData = await getHistoricalData(pair, timeframe);
    const prices = historicalData.map(d => d.close);
    
    if (prices.length < 26) { // Minimum required for MACD
      throw new Error('Insufficient historical data for analysis');
    }
    
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
        ((70 - lastRSI) / 30) * 0.4 +
        (lastMACD.histogram / Math.abs(lastMACD.histogram)) * 0.3 +
        ((lastSMAShort - lastSMALong) / lastSMALong) * 0.3,
        1
      );
    } else if (lastSMAShort < lastSMALong && lastRSI > 30 && lastMACD.histogram < 0) {
      direction = 'sell';
      confidence = Math.min(
        ((lastRSI - 30) / 30) * 0.4 +
        (Math.abs(lastMACD.histogram) / lastMACD.histogram) * 0.3 +
        ((lastSMALong - lastSMAShort) / lastSMALong) * 0.3,
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
      expiryTime: Date.now() + (timeframe * 60 * 1000)
    };
  } catch (error) {
    console.error('Error generating signal:', error);
    throw error;
  }
};

/**
 * Get performance metrics based on historical signals
 */
export const getPerformanceMetrics = async (pair: string, timeframe: number): Promise<PerformanceMetric> => {
  try {
    const historicalData = await getHistoricalData(pair, timeframe * 2);
    let totalSignals = 0;
    let successfulSignals = 0;
    
    // Simple backtesting
    for (let i = 0; i < historicalData.length - timeframe; i++) {
      const testData = historicalData.slice(i, i + timeframe);
      const prices = testData.map(d => d.close);
      
      if (prices.length < 26) { // Minimum required for MACD
        continue;
      }
      
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
    
    if (totalSignals === 0) {
      throw new Error('Insufficient data for performance metrics');
    }
    
    return {
      pair,
      timeframe,
      winRate: successfulSignals / totalSignals,
      totalSignals,
      successfulSignals,
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    throw new Error('Failed to fetch performance metrics');
  }
};