import { ForexPair, TimeFrame } from '../types';

export const FOREX_PAIRS: ForexPair[] = [
  { id: 'eurusd', name: 'EUR/USD', symbol: '€/$' },
  { id: 'usdjpy', name: 'USD/JPY', symbol: '$/??' },
  { id: 'gbpusd', name: 'GBP/USD', symbol: '£/$' },
  { id: 'usdcad', name: 'USD/CAD', symbol: '$/C$' },
  { id: 'audusd', name: 'AUD/USD', symbol: 'A$/$' },
  { id: 'nzdusd', name: 'NZD/USD', symbol: 'NZ$/$' },
  { id: 'usdchf', name: 'USD/CHF', symbol: '$/Fr' },
  { id: 'eurjpy', name: 'EUR/JPY', symbol: '€/??' },
  { id: 'eurgbp', name: 'EUR/GBP', symbol: '€/£' },
  { id: 'gbpjpy', name: 'GBP/JPY', symbol: '£/??' },
];

export const TIME_FRAMES: TimeFrame[] = [
  { id: '1m', name: '1 Minute', minutes: 1 },
  { id: '5m', name: '5 Minutes', minutes: 5 },
  { id: '10m', name: '10 Minutes', minutes: 10 },
];

export const REFRESH_INTERVAL = 10000; // 10 seconds

export const COLORS = {
  primary: '#2563EB',
  secondary: '#0F172A',
  accent: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: '#64748B',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
};

export const MOCK_API_DELAY = 1000; // 1 second delay for mock API responses