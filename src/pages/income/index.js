import React, { useState, useEffect, useContext } from 'react';import axios from 'axios';
import './index.scss';
import Loader from 'react-loaders';
import { BalanceContext } from '../balance_context/BalanceContext';

const Income = () => {
  const { balance, setBalance } = useContext(BalanceContext);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIncome, setNewIncome] = useState({
    senderName: '',
    incomeType: '',
    amountReceived: '',
    date: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    axios.get(`http://localhost:5000/api/income/${userId}`)
      .then(response => {
        setIncomes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the incomes!', error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncome(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    axios.post('http://localhost:5000/api/income', { userId, ...newIncome })
      .then(response => {
        setIncomes([...incomes, response.data]);
        setNewIncome({
          senderName: '',
          incomeType: '',
          amountReceived: '',
          date: ''
        });
      })
      .catch(error => {
        console.error('There was an error adding the income!', error);
      });
  };

  return (
    <div className='container-income-page'>
      {loading ? <Loader type="ball-spin-fade-loader" /> : (
        <>
          <h1>INCOME</h1>
          <table>
            <thead>
              <tr>
                <th>Sender Name</th>
                <th>Income Type</th>
                <th>Amount Received</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map(income => (
                <tr key={income.id}>
                  <td>{income.senderName}</td>
                  <td>{income.incomeType}</td>
                  <td>{income.amountReceived}</td>
                  <td>{income.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseIncomeForm" aria-expanded="false" aria-controls="collapseIncomeForm">
              Add New Income
            </button>
          </p>
          <div style={{ minHeight: '120px' }}>
            <div className="collapse collapse-horizontal" id="collapseIncomeForm">
              <div className="card card-body" style={{ width: '300px' }}>
                <form onSubmit={handleSubmit}>
                  <input type="text" name="senderName" value={newIncome.senderName} onChange={handleInputChange} placeholder="Sender Name" required />
                  <input type="text" name="incomeType" value={newIncome.incomeType} onChange={handleInputChange} placeholder="Income Type" required />
                  <input type="number" name="amountReceived" value={newIncome.amountReceived} onChange={handleInputChange} placeholder="Amount Received" required />
                  <input type="date" name="date" value={newIncome.date} onChange={handleInputChange} required />
                  <button type="submit">Add Income</button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Income;
