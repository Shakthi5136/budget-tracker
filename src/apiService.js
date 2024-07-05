// src/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:5001'; 

export const getRandomTip = async () => {
  const response = await axios.get(`${API_URL}/tips`);
  return response.data;
};

export const getTipByCategory = async (category) => {
  const response = await axios.get(`${API_URL}/tips/category/${category}`);
  return response.data;
};

export const addTip = async (category, tip) => {
  const response = await axios.post(`${API_URL}/tips`, { category, tip });
  return response.data;
};
