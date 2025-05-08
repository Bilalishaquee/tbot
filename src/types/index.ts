export interface ForexPair {
  id: string;
  name: string;
  symbol: string;
}

export interface TimeFrame {
  id: string;
  name: string;
  minutes: number;
}

export interface SignalData {
  pair: string;
  timeframe: number;
  direction: 'buy' | 'sell' | 'neutral';
  confidence: number;
  timestamp: number;
  price: number;
  expiryTime: number;
}

export interface MarketData {
  pair: string;
  price: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
  volume?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
  }[];
}

export interface PerformanceMetric {
  timeframe: number;
  pair: string;
  winRate: number;
  totalSignals: number;
  successfulSignals: number;
}