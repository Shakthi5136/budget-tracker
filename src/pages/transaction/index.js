import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.scss';
import Loader from 'react-loaders';
import { BalanceContext } from '../balance_context/BalanceContext';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const { setBalance } = useContext(BalanceContext);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    cardNumber: '',
    name: '',
    merchant: '',
    amount: '',
    date: '',
    status: '',
    userId: userId
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/transactions/${userId}`)
    .then(response => {
      console.log('Setting transactions state:', response.data);
      setTransactions(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('There was an error fetching the transactions!', error);
      setLoading(false);
    });
  
    // Fetch family members
    axios.get(`http://localhost:5000/api/family_members/${userId}`)
      .then(response => {
        setFamilyMembers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the family members!', error);
      });
  }, [userId]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/transactions', newTransaction)
      .then(response => {
        setTransactions([...transactions, response.data]);
        setNewTransaction({
          cardNumber: '',
          name: '',
          merchant: '',
          amount: '',
          date: '',
          status: '',
          userId: userId
        });

        // Update the balance after adding a transaction
        axios.get(`http://localhost:5000/api/balance/${userId}`)
          .then(response => {
            setBalance(response.data.balance);
          })
          .catch(error => {
            console.error('There was an error updating the balance!', error);
          });
      })
      .catch(error => {
        console.error('There was an error adding the transaction!', error);
      });
  };

  return (
    <div className='container-transaction-page'>
      {loading ? <Loader type="ball-spin-fade-loader" /> : (
        <>
          <h1>Transactions</h1>
          <table>
            <thead>
              <tr>
                <th>Card Number</th>
                <th>Name</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.cardNumber}</td>
                  <td>{transaction.name}</td>
                  <td>{transaction.merchant}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p>
            <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
              Add New Transaction
            </button>
          </p>
          <div style={{ minHeight: '120px' }}>
            <div className="collapse collapse-horizontal" id="collapseWidthExample">
              <div className="card card-body" style={{ width: '300px' }}>
                <form onSubmit={handleSubmit}>
                  <input type="text" name="cardNumber" value={newTransaction.cardNumber} onChange={handleInputChange} placeholder="Card Number" required />
                  <select name="name" value={newTransaction.name} onChange={handleInputChange} required>
                    <option value="">Select Family Member</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                  <input type="text" name="merchant" value={newTransaction.merchant} onChange={handleInputChange} placeholder="Merchant" required />
                  <input type="number" name="amount" value={newTransaction.amount} onChange={handleInputChange} placeholder="Amount" required />
                  <input type="date" name="date" value={newTransaction.date} onChange={handleInputChange} required />
                  <select name="status" value={newTransaction.status} onChange={handleInputChange} required>
                    <option value="">Select Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <button type="submit">Add Transaction</button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Transaction;
