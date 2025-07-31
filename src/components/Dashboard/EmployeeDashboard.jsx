import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { getDashboardMetrics } from '../../api/api';

const EmployeeDashboard = () => {
  const [metrics, setMetrics] = useState({ totalSales: 0, tasks: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardMetrics();
        setMetrics(response.data || { totalSales: 1000, tasks: 3 });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchData();
  }, []);

  const taskData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [metrics.tasks || 0, 5 - (metrics.tasks || 0)],
      backgroundColor: ['#4BC0C0', '#FFCE56'],
    }],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Employee Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Today’s Sales</h2>
          <p className="text-xl">${metrics.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Tasks Assigned</h2>
          <p className="text-xl">{metrics.tasks}</p>
        </div>
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Task Status</h2>
          <Pie data={taskData} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;