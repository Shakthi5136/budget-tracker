import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const FamilySpendingPieChart = ({ userId }) => {
  const [spendingData, setSpendingData] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    fetchSpendingData(userId);
  }, [userId]);

  const fetchSpendingData = async (userId) => {
    console.log('Fetching spending data for user:', userId);
    try {
      const response = await fetch(`http://localhost:5000/api/spending_by_family_member/${userId}`);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      const data = JSON.parse(responseText);
      console.log('Fetched spending data:', data);
      setSpendingData(data);
      console.log('Spending data state updated:', data);
    } catch (error) {
      console.error('Error fetching spending data:', error);
    }
  };

  useEffect(() => {
    if (spendingData.length > 0) {
      renderPieChart();
    }
  }, [spendingData]);

  const renderPieChart = () => {
    console.log('Rendering pie chart with data:', spendingData);
    const labels = spendingData.map((item) => item.name);
    const amounts = spendingData.map((item) => item.totalSpent);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB', '#FF6384'
    ]; // Add more colors as needed

    const ctx = document.getElementById('familySpendingChart');

    if (chartInstance) {
      chartInstance.destroy(); // Destroy the previous chart instance
    }

    if (ctx) {
      const newChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Spending',
            data: amounts,
            backgroundColor: colors.slice(0, labels.length),
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
                }
              }
            }
          }
        }
      });

      setChartInstance(newChartInstance);
    }
  };

  return (
    <div>
      <h2>Family Spending Pie Chart</h2>
      {spendingData.length > 0 ? (
        <div>
          <canvas id="familySpendingChart" width="400" height="400"></canvas>
        </div>
      ) : (
        <p>No spending data available.</p>
      )}
    </div>
  );
};

export default FamilySpendingPieChart;
