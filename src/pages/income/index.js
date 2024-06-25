import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const Income = () => {
  const [balance, setBalance] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setBalance(e.target.value);
  };

  const handleSubmit = async () => {
    const parsedBalance = parseFloat(balance);
    if (!isNaN(parsedBalance)) {
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

      // Send balance to the backend
      try {
        const response = await fetch('http://localhost:3002/api/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, balance: parsedBalance }),
        });

        if (response.ok) {
          alert('Balance updated successfully');
        } else {
          alert('Failed to update balance');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
      }
    } else {
      alert('Please enter a valid number');
    }
  };

  return (
    <div className='container-income-page'>
      <p>This is Income page</p>
      <input
        type='number'
        placeholder='Enter your balance'
        value={balance}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit}>Update</button>
    </div>
  );
};

export default Income;
