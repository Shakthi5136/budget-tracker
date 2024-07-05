// src/components/TipComponent.js
import React, { useState, useEffect } from 'react';
import { getRandomTip, getTipByCategory, addTip } from '../../apiService';
import './TipComponent.scss'

const TipComponent = () => {
  const [tip, setTip] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchRandomTip();
  }, []);

  const fetchRandomTip = async () => {
    const result = await getRandomTip();
    setTip(result.tip);
  };



  return (
    <div className='tip-component'>
     
      {tip && (
        
          <p className='tips'>{tip}</p>
        
      )}
      <button className='tip-button' onClick={fetchRandomTip}>NEXT</button>
    </div>
  );
};

export default TipComponent;