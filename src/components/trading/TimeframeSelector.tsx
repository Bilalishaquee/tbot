import React from 'react';
import { TimeFrame } from '../../types';
import { TIME_FRAMES } from '../../utils/constants';
import Card from '../common/Card';

interface TimeframeSelectorProps {
  selectedTimeframe: number;
  onSelectTimeframe: (timeframe: number) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onSelectTimeframe,
}) => {
  return (
    <Card title="Trading Timeframe" className="h-full">
      <div className="flex flex-col gap-2 mt-2">
        {TIME_FRAMES.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => onSelectTimeframe(timeframe.minutes)}
            className={`
              py-3 px-4 rounded-md text-center transition-all duration-200
              ${selectedTimeframe === timeframe.minutes 
                ? 'bg-blue-600 text-white font-medium ring-2 ring-blue-500 ring-opacity-50' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }
            `}
          >
            {timeframe.name}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>Select the trading timeframe for binary options.</p>
        <p className="mt-1">Shorter timeframes may offer more trading opportunities but can be more volatile.</p>
      </div>
    </Card>
  );
};

export default TimeframeSelector;