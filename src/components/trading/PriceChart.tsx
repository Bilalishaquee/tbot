import React, { useEffect, useState } from 'react';
import { MarketData } from '../../types';
import Card from '../common/Card';
import { formatTime } from '../../utils/formatters';

interface PriceChartProps {
  data: MarketData[];
  loading: boolean;
  pairName: string;
  timeframeName: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  loading,
  pairName,
  timeframeName,
}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(200);
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  
  // Reference for the chart container
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Update chart dimensions when window is resized
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.clientWidth - padding.left - padding.right);
        setChartHeight(200);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  if (loading || data.length === 0) {
    return (
      <Card title={`${pairName || 'Price'} Chart (${timeframeName || 'Select Timeframe'})`} className="h-full">
        <div className="h-[300px] w-full flex items-center justify-center">
          <p className="text-gray-400">Loading chart data...</p>
        </div>
      </Card>
    );
  }
  
  // Calculate min and max values for the y-axis
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.9995;
  const maxPrice = Math.max(...prices) * 1.0005;
  
  // Calculate scales for x and y axes
  const xScale = (i: number) => (i * (chartWidth / (data.length - 1)));
  const yScale = (price: number) => chartHeight - ((price - minPrice) / (maxPrice - minPrice) * chartHeight);
  
  // Generate path for the line chart
  const linePath = data.map((d, i) => {
    const x = xScale(i);
    const y = yScale(d.price);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Generate gradient for the area under the line
  const startPrice = data[0].price;
  const endPrice = data[data.length - 1].price;
  const gradientColor = endPrice >= startPrice ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
  
  return (
    <Card title={`${pairName || 'Price'} Chart (${timeframeName || 'Select Timeframe'})`} className="h-full">
      <div className="h-[300px] w-full" ref={chartRef}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={endPrice >= startPrice ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'} />
              <stop offset="100%" stopColor="rgba(30, 41, 59, 0)" />
            </linearGradient>
          </defs>
          
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Y-axis */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={chartHeight}
              stroke="#4B5563"
              strokeWidth="1"
            />
            
            {/* Y-axis ticks and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const tickPrice = minPrice + (maxPrice - minPrice) * (1 - tick);
              return (
                <g key={tick} transform={`translate(0, ${chartHeight * tick})`}>
                  <line x1="-5" y1="0" x2="0" y2="0" stroke="#4B5563" strokeWidth="1" />
                  <text x="-10" y="4" textAnchor="end" fill="#9CA3AF" fontSize="10">
                    {tickPrice.toFixed(5)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis */}
            <line
              x1="0"
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#4B5563"
              strokeWidth="1"
            />
            
            {/* X-axis ticks and labels */}
            {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => {
              const xPos = xScale(data.indexOf(d));
              return (
                <g key={i} transform={`translate(${xPos}, ${chartHeight})`}>
                  <line x1="0" y1="0" x2="0" y2="5" stroke="#4B5563" strokeWidth="1" />
                  <text x="0" y="20" textAnchor="middle" fill="#9CA3AF" fontSize="10">
                    {formatTime(d.timestamp)}
                  </text>
                </g>
              );
            })}
            
            {/* Price line */}
            <path
              d={linePath}
              fill="none"
              stroke={endPrice >= startPrice ? '#10B981' : '#EF4444'}
              strokeWidth="2"
            />
            
            {/* Area under the price line */}
            <path
              d={`${linePath} L ${xScale(data.length - 1)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`}
              fill="url(#areaGradient)"
            />
            
            {/* Price points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(d.price)}
                r="2"
                fill={endPrice >= startPrice ? '#10B981' : '#EF4444'}
              />
            ))}
            
            {/* Current price label */}
            <g transform={`translate(${chartWidth}, ${yScale(endPrice)})`}>
              <rect
                x="5"
                y="-10"
                width="55"
                height="20"
                rx="3"
                fill={endPrice >= startPrice ? '#10B981' : '#EF4444'}
              />
              <text x="30" y="2" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                {endPrice.toFixed(5)}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </Card>
  );
};

export default PriceChart;