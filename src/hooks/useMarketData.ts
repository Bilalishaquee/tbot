import { useState, useEffect } from 'react';
import { MarketData } from '../types';
import { getMarketData, getHistoricalData } from '../services/api';
import { REFRESH_INTERVAL } from '../utils/constants';

export const useMarketData = (pair: string, timeframe: number) => {
  const [currentData, setCurrentData] = useState<MarketData | null>(null);
  const [historicalData, setHistoricalData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current market data
  useEffect(() => {
    if (!pair) return;

    const fetchData = async () => {
      try {
        const data = await getMarketData(pair);
        setCurrentData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [pair]);

  // Fetch historical market data when pair or timeframe changes
  useEffect(() => {
    if (!pair || !timeframe) return;
    
    setLoading(true);
    
    const fetchHistoricalData = async () => {
      try {
        const data = await getHistoricalData(pair, timeframe);
        setHistoricalData(data);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to fetch historical data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchHistoricalData();
  }, [pair, timeframe]);

  return { currentData, historicalData, loading, error };
};