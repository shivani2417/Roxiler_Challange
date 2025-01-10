// frontend/src/components/PieChart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ month }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchPieChartData();
  }, [month]);

  const fetchPieChartData = async () => {
    try {
      const response = await axios.get('/api/pie-chart', { params: { month } });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    }
  };

  if (!data) return <div>Loading...</div>;

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        label: 'Number of Items',
        data: data.map((d) => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={chartData} />;
};

export default PieChart;