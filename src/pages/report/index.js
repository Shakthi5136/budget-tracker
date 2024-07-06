import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './index.scss';
import Loader from 'react-loaders';
import { BalanceContext } from '../balance_context/BalanceContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Report = () => {
  const { balance, setBalance } = useContext(BalanceContext);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    fetchAllTransactions(userId);
  }, []);

  useEffect(() => {
    filterTransactionsByDate(selectedDate);
  }, [selectedDate, allTransactions]);

  const fetchAllTransactions = (userId) => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/recent-transactions/${userId}`)
      .then(response => {
        console.log('Fetched all transactions:', response.data);
        setAllTransactions(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the transactions!', error);
        setLoading(false);
      });
  };

  const filterTransactionsByDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
    console.log(`Selected date: ${formattedDate}`);
    const filteredTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      console.log(`Transaction date: ${transactionDate}`);
      return transactionDate === formattedDate;
    });
    setTransactions(filteredTransactions);
    console.log('Filtered transactions:', filteredTransactions);
  };

  return (
    <div className='App'>
      <h1>Recent Transactions</h1>
      <div className='calendar-container'>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
        />
      </div>
      <div className='transaction-details'>
        {loading ? <Loader type="ball-spin-fade-loader" /> : (
          transactions.length === 0 ? (
            <p>No transactions found for this date.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.name}</td>
                    <td className={transaction.type === 'expense' ? 'expense' : 'income'}>
                      {transaction.type === 'expense' ? '-' : '+'}${Math.abs(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default Report;
