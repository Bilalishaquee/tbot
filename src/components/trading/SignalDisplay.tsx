import React, { useState, useEffect } from 'react';
import { formatTimeRemaining, formatNumber, confidenceToString } from '../../utils/formatters';
import { SignalData } from '../../types';
import { ArrowUp, ArrowDown, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

interface SignalDisplayProps {
  signal: SignalData | null;
  loading: boolean;
  timeRemaining: number;
  onRefresh: () => void;
  pairName: string;
}

const SignalDisplay: React.FC<SignalDisplayProps> = ({
  signal,
  loading,
  timeRemaining,
  onRefresh,
  pairName,
}) => {
  const [isSignalNew, setIsSignalNew] = useState(false);

  // Visual feedback when a new signal is received
  useEffect(() => {
    if (signal) {
      setIsSignalNew(true);
      const timer = setTimeout(() => setIsSignalNew(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [signal]);

  const getSignalColor = () => {
    if (!signal) return 'bg-gray-700';
    switch (signal.direction) {
      case 'buy':
        return 'bg-green-600';
      case 'sell':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getSignalIcon = () => {
    if (!signal) return null;
    switch (signal.direction) {
      case 'buy':
        return <ArrowUp className="h-8 w-8 text-white" />;
      case 'sell':
        return <ArrowDown className="h-8 w-8 text-white" />;
      default:
        return <AlertCircle className="h-8 w-8 text-white" />;
    }
  };

  const getSignalText = () => {
    if (!signal) return 'Waiting for signal...';
    switch (signal.direction) {
      case 'buy':
        return 'BUY';
      case 'sell':
        return 'SELL';
      default:
        return 'NEUTRAL';
    }
  };

  return (
    <Card title={`Trading Signal: ${pairName || 'Select Pair'}`} className="h-full">
      <div
        className={`
          relative overflow-hidden rounded-lg p-4 transition-all duration-300
          ${getSignalColor()}
          ${isSignalNew ? 'scale-105 shadow-lg' : ''}
        `}
      >
        {isSignalNew && (
          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 bg-black bg-opacity-20 rounded-full mr-3">
              {getSignalIcon()}
            </div>
            <div>
              <div className="text-xl font-bold text-white">{getSignalText()}</div>
              {signal && (
                <div className="text-sm text-white text-opacity-80">
                  Confidence: {confidenceToString(signal.confidence)}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            {signal && (
              <div className="text-xl font-mono text-white">
                {formatNumber(signal.price, 5)}
              </div>
            )}
            <div className="text-sm text-white text-opacity-80">
              {timeRemaining > 0 ? `Expires in: ${formatTimeRemaining(timeRemaining)}` : 'Expired'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {loading ? 'Generating signal...' : 'Signal ready'}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button 
            className="py-3 px-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-md font-medium transition-colors duration-150"
            disabled={!signal || loading}
          >
            Enter BUY
          </button>
          <button 
            className="py-3 px-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md font-medium transition-colors duration-150"
            disabled={!signal || loading}
          >
            Enter SELL
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SignalDisplay;