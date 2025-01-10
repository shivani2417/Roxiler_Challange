// frontend/src/components/BarChart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ month }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchBarChartData();
  }, [month]);

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get('/api/bar-chart', { params: { month } });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  if (!data) return <div>Loading...</div>;

  const chartData = {
    labels: data.map((d) => d.range),
    datasets: [
      {
        label: 'Number of Items',
        data: data.map((d) => d.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default BarChart;