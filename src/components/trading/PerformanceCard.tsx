import React from 'react';
import { PerformanceMetric } from '../../types';
import { formatPercentage } from '../../utils/formatters';
import Card from '../common/Card';
import { Award, Activity, TrendingUp } from 'lucide-react';

interface PerformanceCardProps {
  performance: PerformanceMetric | null;
  loading: boolean;
  timeframeName: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  performance,
  loading,
  timeframeName,
}) => {
  if (loading || !performance) {
    return (
      <Card title="Performance Metrics" className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Define color based on win rate
  const getWinRateColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-500';
    if (rate >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const winRateColor = getWinRateColor(performance.winRate);

  return (
    <Card title="Performance Metrics" className="h-full">
      <div className="space-y-4">
        <div className="text-gray-400 text-sm">
          Historical performance for {performance.pair} on {timeframeName} timeframe
        </div>

        <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="text-yellow-500 h-5 w-5 mr-1" />
              <span className="text-gray-300">Win Rate</span>
            </div>
            <div className={`text-3xl font-bold ${winRateColor}`}>
              {formatPercentage(performance.winRate)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center mb-1">
              <Activity className="text-blue-500 h-4 w-4 mr-1" />
              <span className="text-gray-400 text-xs">Total Signals</span>
            </div>
            <div className="text-xl font-medium text-white">
              {performance.totalSignals}
            </div>
          </div>
          
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center mb-1">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-gray-400 text-xs">Successful</span>
            </div>
            <div className="text-xl font-medium text-white">
              {performance.successfulSignals}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceCard;