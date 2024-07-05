import React, { useState } from 'react';
import axios from 'axios';
import './index.scss';
import Loader from 'react-loaders';

const Adduser = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const userId = localStorage.getItem('userId');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios.post('http://localhost:5000/api/additional_users', { userId, name })
      .then(response => {
        console.log('Family member added:', response.data);
        setName('');
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error adding the family member!', error);
        setLoading(false);
      });
  };

  return (
    <div className='container-add-user-page'>
      <h1>Add Family Member</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Family Member Name"
          required
        />
        <button type="submit">Add Family Member</button>
      </form>
      {loading && <Loader type="ball-spin-fade-loader" />}
    </div>
  );
};

export default Adduser;
