// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
  const [month, setMonth] = useState('March');
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [month, page, search]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions', {
        params: { month, page, search },
      });
      setTransactions(response.data.transactions);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setPage(1);
    setSearch('');
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="App">
      <header>
        <h1>Transactions Dashboard</h1>
      </header>

      <div className="controls">
        <label>
          Select Month:
          <select value={month} onChange={handleMonthChange}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          placeholder="Search transactions"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <TransactionsTable
        transactions={transactions}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
      <Statistics month={month} />
      <BarChart month={month} />
      <PieChart month={month} />
    </div>
  );
};

export default App;
