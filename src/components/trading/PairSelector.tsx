import React, { useState, useEffect } from 'react';
import { ForexPair } from '../../types';
import { getAvailablePairs } from '../../services/mockApi';
import Select from '../common/Select';
import Card from '../common/Card';

interface PairSelectorProps {
  selectedPair: string;
  onSelectPair: (pair: string) => void;
}

const PairSelector: React.FC<PairSelectorProps> = ({ selectedPair, onSelectPair }) => {
  const [pairs, setPairs] = useState<ForexPair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const availablePairs = await getAvailablePairs();
        setPairs(availablePairs);
        if (!selectedPair && availablePairs.length > 0) {
          onSelectPair(availablePairs[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch pairs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, [onSelectPair, selectedPair]);

  const handleChange = (value: string) => {
    onSelectPair(value);
  };

  const selectedPairInfo = pairs.find(p => p.id === selectedPair);

  return (
    <Card title="Currency Pair" className="h-full">
      <div className="space-y-4">
        <Select
          label="Select Trading Pair"
          options={pairs}
          value={selectedPair}
          onChange={handleChange}
          placeholder="Select currency pair"
          disabled={loading}
        />

        {selectedPairInfo && (
          <div className="mt-4 p-3 bg-gray-700 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Selected Pair:</span>
              <span className="text-white font-medium">{selectedPairInfo.name}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-300">Symbol:</span>
              <span className="text-white font-medium">{selectedPairInfo.symbol}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PairSelector;