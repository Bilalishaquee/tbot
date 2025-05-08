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
  const rate = data['Realtime Currency Exchange Rate'];
  
  const price = parseFloat(rate['5. Exchange Rate']);
  
  return {
    pair,
    price,
    high: price * 1.001, // Estimated
    low: price * 0.999,  // Estimated
    open: price,
    close: price,
    timestamp: Date.now(),
    volume: Math.floor(Math.random() * 1000), // Dummy volume
  };
};

/**
 * Fetch 5-minute interval chart data for a currency pair
 */
export const getForexChartData = async (pair: string) => {
  const fromCurrency = pair.slice(0, 3).toUpperCase();
  const toCurrency = pair.slice(3, 6).toUpperCase();

  const response = await fetch(
    `${BASE_URL}?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`
  );

  const data = await response.json();
  const timeSeries = data['Time Series FX (5min)'];

  if (!timeSeries) {
    throw new Error('Invalid API response from Alpha Vantage');
  }

  return Object.entries(timeSeries).map(([time, values]: any) => ({
    time,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
  }));
};

/**
 * Fetch historical market data for a currency pair
 */
export const getHistoricalData = async (pair: string, timeframe: number): Promise<MarketData[]> => {
  const chartData = await getForexChartData(pair);
  return chartData.slice(0, timeframe).map(data => ({
    pair,
    price: data.close,
    high: data.high,
    low: data.low,
    open: data.open,
    close: data.close,
    timestamp: new Date(data.time).getTime(),
    volume: Math.floor(Math.random() * 1000), // Dummy volume for demo
  }));
};

/**
 * Generate trading signal based on technical indicators
 */
export const generateSignal = async (pair: string, timeframe: number): Promise<SignalData> => {
  const historicalData = await getHistoricalData(pair, timeframe);
  const prices = historicalData.map(d => d.close);
  
  // Calculate technical indicators
  const sma = SMA.calculate({ period: 14, values: prices });
  const rsi = RSI.calculate({ period: 14, values: prices });
  const macd = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    values: prices
  });
  
  // Simple signal generation logic
  const lastPrice = prices[prices.length - 1];
  const lastSMA = sma[sma.length - 1];
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macd[macd.length - 1];
  
  let signal: 'buy' | 'sell' | 'hold' = 'hold';
  
  if (lastPrice > lastSMA && lastRSI < 70 && lastMACD.histogram > 0) {
    signal = 'buy';
  } else if (lastPrice < lastSMA && lastRSI > 30 && lastMACD.histogram < 0) {
    signal = 'sell';
  }
  
  return {
    pair,
    signal,
    price: lastPrice,
    timestamp: Date.now(),
    expiryTime: Date.now() + 300000, // Signal expires in 5 minutes
    indicators: {
      sma: lastSMA,
      rsi: lastRSI,
      macd: lastMACD
    }
  };
};

/**
 * Get performance metrics for the signal generator
 */
export const getPerformanceMetrics = async (pair: string, timeframe: number): Promise<PerformanceMetric> => {
  const historicalData = await getHistoricalData(pair, timeframe);
  
  // Calculate mock performance metrics
  const totalTrades = 100;
  const winningTrades = Math.floor(Math.random() * 70) + 30; // 30-100 winning trades
  const losingTrades = totalTrades - winningTrades;
  
  const averageWin = Math.random() * 2 + 1; // 1-3% average win
  const averageLoss = Math.random() * 1 + 0.5; // 0.5-1.5% average loss
  
  return {
    pair,
    timeframe,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: (winningTrades / totalTrades) * 100,
    averageWin,
    averageLoss,
    profitFactor: (winningTrades * averageWin) / (losingTrades * averageLoss),
    sharpeRatio: Math.random() * 1 + 0.5, // Mock Sharpe ratio
    maxDrawdown: Math.random() * 10 + 5, // 5-15% max drawdown
    period: {
      start: historicalData[historicalData.length - 1].timestamp,
      end: historicalData[0].timestamp
    }
  };
};