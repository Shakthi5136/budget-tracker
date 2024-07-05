import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './index.scss';
import Loader from 'react-loaders';
import { BalanceContext } from '../balance_context/BalanceContext';

const RecentTransactions = () => {
  const { balance, setBalance } = useContext(BalanceContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    console.log(`Fetching recent transactions for userId: ${userId}`);
    axios.get(`http://localhost:5000/api/recent-transactions/${userId}`)
      .then(response => {
        console.log('Fetched transactions:', response.data);
        setTransactions(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the transactions!', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='container-recent-transactions'>
      {loading ? <Loader type="ball-spin-fade-loader" /> : (
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
      )}
    </div>
  );
};

export default RecentTransactions;
