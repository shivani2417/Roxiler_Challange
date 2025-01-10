// frontend/src/components/Statistics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics', { params: { month } });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  if (!statistics) return <div>Loading...</div>;

  return (
    <div className="statistics">
      <div>Total Sale Amount: {statistics.totalSaleAmount}</div>
      <div>Sold Items: {statistics.soldItems}</div>
      <div>Not Sold Items: {statistics.notSoldItems}</div>
    </div>
  );
};

export default Statistics;