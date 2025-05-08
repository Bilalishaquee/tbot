import React, { useState, useMemo } from 'react';
import PairSelector from './PairSelector';
import TimeframeSelector from './TimeframeSelector';
import SignalDisplay from './SignalDisplay';
import PerformanceCard from './PerformanceCard';
import PriceChart from './PriceChart';
import { useMarketData } from '../../hooks/useMarketData';
import { useSignalGenerator } from '../../hooks/useSignalGenerator';
import { FOREX_PAIRS, TIME_FRAMES } from '../../utils/constants';

const TradingDashboard: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(5); // Default to 5 minutes

  // Get pair and timeframe details for display
  const selectedPairInfo = useMemo(() => 
    FOREX_PAIRS.find(pair => pair.id === selectedPair), 
    [selectedPair]
  );

  const selectedTimeframeInfo = useMemo(() => 
    TIME_FRAMES.find(tf => tf.minutes === selectedTimeframe), 
    [selectedTimeframe]
  );

  // Fetch market data
  const { 
    currentData, 
    historicalData, 
    loading: loadingMarket 
  } = useMarketData(selectedPair, selectedTimeframe);

  // Generate trading signals
  const { 
    signal, 
    performance, 
    timeRemaining, 
    loading: loadingSignal, 
    error: signalError 
  } = useSignalGenerator(selectedPair, selectedTimeframe);

  // Handler to refresh signal
  const handleRefreshSignal = () => {
    // Force refresh by changing timeframe and then changing back
    const currentTimeframe = selectedTimeframe;
    const tempTimeframe = currentTimeframe === 5 ? 1 : 5;
    
    setSelectedTimeframe(tempTimeframe);
    setTimeout(() => setSelectedTimeframe(currentTimeframe), 100);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Quotex Trading Bot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Selectors Section */}
        <div className="md:col-span-3 space-y-6">
          <PairSelector 
            selectedPair={selectedPair} 
            onSelectPair={setSelectedPair} 
          />
          
          <TimeframeSelector 
            selectedTimeframe={selectedTimeframe} 
            onSelectTimeframe={setSelectedTimeframe} 
          />
        </div>
        
        {/* Main Content Section */}
        <div className="md:col-span-9 space-y-6">
          {/* Signal and Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignalDisplay 
              signal={signal}
              loading={loadingSignal}
              timeRemaining={timeRemaining}
              onRefresh={handleRefreshSignal}
              pairName={selectedPairInfo?.name || ''}
            />
            
            <PerformanceCard 
              performance={performance}
              loading={loadingSignal}
              timeframeName={selectedTimeframeInfo?.name || ''}
            />
          </div>
          
          {/* Price Chart */}
          <PriceChart 
            data={historicalData}
            loading={loadingMarket}
            pairName={selectedPairInfo?.name || ''}
            timeframeName={selectedTimeframeInfo?.name || ''}
          />
        </div>
      </div>
      
      <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4 text-sm text-blue-300">
        <p className="font-medium">Demo Application Notice:</p>
        <p className="mt-1">This is a simulated environment using mock data. In a production application, you would need to integrate with Quotex's API to retrieve real-time market data and execute trades.</p>
      </div>
    </div>
  );
};

export default TradingDashboard;