import { MarketData } from '../types';
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
