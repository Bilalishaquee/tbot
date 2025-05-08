import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getForexChartData } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

const Chart: React.FC<{ pair: string }> = ({ pair }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await getForexChartData(pair);
        const labels = data.map((entry: any) => new Date(entry.time));
        const prices = data.map((entry: any) => entry.close);

        setChartData({
          labels,
          datasets: [
            {
              label: `${pair.toUpperCase()} Price`,
              data: prices,
              fill: false,
              borderColor: '#3B82F6',
              tension: 0.1,
            },
          ],
        });
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [pair]);

  if (loading) return <p>Loading chart...</p>;
  if (!chartData) return <p>No chart data available.</p>;

  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'minute',
                tooltipFormat: 'PPpp',
              },
              title: { display: true, text: 'Time' },
            },
            y: {
              title: { display: true, text: 'Price' },
            },
          },
        }}
      />
    </div>
  );
};

export default Chart;
