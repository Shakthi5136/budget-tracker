import React, { useEffect, useState, useRef } from 'react';
import './index.scss';
import { useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlane, faHammer, faGamepad, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';

const SlideComponent = ({ icon, title, budget, userId, category, onUpdateBudget }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    setIsLoading(true); // Set loading state when saving
    await onUpdateBudget(userId, category, newBudget);
    setIsEditing(false);
    setIsLoading(false); // Reset loading state after update
  };

  const handleChange = (e) => setNewBudget(Number(e.target.value));

  return (
    <div className='slide-component'>
      <FontAwesomeIcon icon={icon} size='3x' />
      <p>{title}</p>
      <p className='budget'>BUDGET</p>
      {isEditing ? (
        <input
          type='number'
          value={newBudget}
          onChange={handleChange}
        />
      ) : (
        <p className='amount'>${budget.toFixed(2)}</p>
      )}
      {isEditing ? (
        <button disabled={isLoading} onClick={handleSave}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      ) : (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
};

const HomePage = () => {
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [date, setDate] = useState(new Date());
  const userId = localStorage.getItem('userId');
  const slideContainerRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidthRef = useRef(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false); // State for balance loading
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false); // State for update loading

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true); // Set loading state while fetching balance
      try {
        const response = await fetch(`http://localhost:3001/api/balance/${userId}`);
        const data = await response.json();
        setBalance(data.balance || 0);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setIsLoadingBalance(false); // Reset loading state after fetch
      }
    };

    fetchBalance();
  }, [userId]);

  useEffect(() => {
    if (slideContainerRef.current) {
      const slideComponent = slideContainerRef.current.querySelector('.slide-component');
      cardWidthRef.current = slideComponent ? slideComponent.offsetWidth : 0;
    }
  }, []);

  const scrollLeftHandler = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 3);
    }
  };

  const scrollRightHandler = () => {
    if (slideContainerRef.current && slideContainerRef.current.children.length > 3) {
      setScrollIndex(scrollIndex + 3);
    }
  };

  useEffect(() => {
    if (slideContainerRef.current && cardWidthRef.current) {
      slideContainerRef.current.scrollTo({
        left: scrollIndex * cardWidthRef.current,
        behavior: 'smooth',
      });
    }
  }, [scrollIndex]);

  const handleUpdateBudget = async (userId, category, newBudget) => {
    setIsLoadingUpdate(true); // Set loading state while updating budget
    try {
      console.log('Sending update budget request:', { userId, category, newBudget });
      const response = await fetch('http://localhost:3001/api/budget', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, category, newBudget }),
      });
      if (!response.ok) {
        throw new Error('Failed to update budget');
      }
      console.log('Budget updated successfully');
      // Optionally, refetch the data or update the state
      // to reflect the changes
    } catch (error) {
      console.error('Error updating budget:', error);
    } finally {
      setIsLoadingUpdate(false); // Reset loading state after update
    }
  };

  return (
    <div className='container-homepage'>
      <p>DASHBOARD</p>

      <div className='balance'>
        <h1>TOTAL BALANCE:</h1>
        {isLoadingBalance ? (
          <p>Loading balance...</p>
        ) : (
          <h2>${balance.toLocaleString()}</h2>
        )}
      </div>

      <div className='slide-wrapper'>
        <div className='scroll-arrow left' onClick={scrollLeftHandler}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
        <div className='slide-container' ref={slideContainerRef}>
          <SlideComponent
            icon={faPlane}
            title='Holiday trip'
            budget={655.00}
            userId={userId}
            category='Holiday trip'
            onUpdateBudget={handleUpdateBudget}
          />
          <SlideComponent
            icon={faHammer}
            title='Renovation'
            budget={235.00}
            userId={userId}
            category='Renovation'
            onUpdateBudget={handleUpdateBudget}
          />
          <SlideComponent
            icon={faGamepad}
            title='Xbox'
            budget={854.00}
            userId={userId}
            category='Xbox'
            onUpdateBudget={handleUpdateBudget}
          />
          <SlideComponent
            icon={faBirthdayCake}
            title='Birthday'
            budget={495.00}
            userId={userId}
            category='Birthday'
            onUpdateBudget={handleUpdateBudget}
          />
          {/* Add more SlideComponent instances for additional categories */}
        </div>
        <div className='scroll-arrow right' onClick={scrollRightHandler}>
          <FontAwesomeIcon icon={faChevronRight} />
        </div>
      </div>

      <div className='calendar-container'>
        <Calendar onChange={setDate} value={date} />
      </div>
    </div>
  );
};

export default HomePage;
