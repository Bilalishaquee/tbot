import { useState, useEffect } from 'react';
import { SignalData, PerformanceMetric } from '../types';
import { generateSignal, getPerformanceMetrics } from '../services/api';

export const useSignalGenerator = (pair: string, timeframe: number) => {
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetric | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Generate signal when pair or timeframe changes
  useEffect(() => {
    if (!pair || !timeframe) return;
    
    setLoading(true);
    
    const fetchSignal = async () => {
      try {
        const newSignal = await generateSignal(pair, timeframe);
        setSignal(newSignal);
        setTimeRemaining(Math.floor((newSignal.expiryTime - Date.now()) / 1000));
        setError(null);
      } catch (err) {
        setError('Failed to generate signal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [pair, timeframe]);

  // Update time remaining
  useEffect(() => {
    if (!signal) return;

    const timer = setInterval(() => {
      const remaining = Math.floor((signal.expiryTime - Date.now()) / 1000);
      setTimeRemaining(remaining > 0 ? remaining : 0);
      
      // Generate new signal when expired
      if (remaining <= 0) {
        generateSignal(pair, timeframe)
          .then(newSignal => {
            setSignal(newSignal);
            setTimeRemaining(Math.floor((newSignal.expiryTime - Date.now()) / 1000));
          })
          .catch(err => {
            setError('Failed to refresh signal');
            console.error(err);
          });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [signal, pair, timeframe]);

  // Fetch performance metrics
  useEffect(() => {
    if (!pair || !timeframe) return;
    
    const fetchPerformance = async () => {
      try {
        const metrics = await getPerformanceMetrics(pair, timeframe);
        setPerformance(metrics);
      } catch (err) {
        console.error('Failed to fetch performance metrics', err);
      }
    };

    fetchPerformance();
  }, [pair, timeframe]);

  return { signal, performance, timeRemaining, loading, error };
};