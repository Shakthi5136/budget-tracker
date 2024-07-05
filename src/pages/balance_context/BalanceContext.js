// BalanceContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/balance/${userId}`)
      .then(response => {
        setBalance(response.data.balance);
      })
      .catch(error => {
        console.error('There was an error fetching the balance!', error);
      });
  }, [userId]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
