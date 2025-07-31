import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AreaChart from './Charts/AreaChart';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [activeTab, setActiveTab] = useState('General');
  const [selectedPeriod, setSelectedPeriod] = useState('Day');
  const [error, setError] = useState(null);

  const username = localStorage.getItem('username') || 'Manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/dashboard/manager?period=${selectedPeriod}`);
        setDashboardData(response.data?.data || {});
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  const chartData = {
    labels: ['Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020', 'Jan 2021'],
    datasets: [
      {
        label: 'Trend',
        data: [50, 65, 60, 62, 58, 55, 53],
        fill: true,
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 1,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { title: { display: false } },
      y: { title: { display: false }, ticks: { display: false } },
    },
    maintainAspectRatio: false,
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome, {username}</h1>
      <div className="flex justify-between mb-6">
        <div>
          <button
            className={`px-4 py-2 mr-2 rounded ${activeTab === 'General' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setActiveTab('General')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'Inventory' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setActiveTab('Inventory')}
          >
            Inventory
          </button>
        </div>
        <div>
          <button
            className={`px-4 py-2 mr-2 rounded ${selectedPeriod === 'Day' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setSelectedPeriod('Day')}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded ${selectedPeriod === 'Week' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setSelectedPeriod('Week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded ${selectedPeriod === 'Month' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setSelectedPeriod('Month')}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedPeriod === 'Custom' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}
            onClick={() => setSelectedPeriod('Custom')}
          >
            Custom
          </button>
        </div>
      </div>
      {activeTab === 'General' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-sans text-gray-700 mb-2">Sales</h2>
            <p className="text-3xl font-bold mb-4">{dashboardData.TotalSales || 10}</p>
            <div className="h-32">
              <AreaChart data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-sans text-gray-700 mb-2">Net Sales (SAR)</h2>
            <p className="text-3xl font-bold mb-4">{dashboardData.TodaysSales ? dashboardData.TodaysSales.toFixed(3) : 117.913}</p>
            <div className="h-32">
              <AreaChart data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-sans text-gray-700 mb-2">Net Income (SAR)</h2>
            <p className="text-3xl font-bold mb-4">{dashboardData.NetIncome ? dashboardData.NetIncome.toFixed(3) : 135.600}</p>
            <div className="h-32">
              <AreaChart data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
      {/* Inventory tab content can be added here later */}
    </div>
  );
};

export default ManagerDashboard;