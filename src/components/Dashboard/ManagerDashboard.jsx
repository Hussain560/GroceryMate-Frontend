import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import LineChart from './Charts/LineChart';
import PieChart from './Charts/PieChart';
import BarChart from './Charts/BarChart';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [activeTab, setActiveTab] = useState('General');
  const [selectedPeriod, setSelectedPeriod] = useState('Day');
  const [error, setError] = useState(null);
  const username = localStorage.getItem('username') || 'Manager';
  const role = localStorage.getItem('role') || 'Manager';
  const location = useLocation();
  const navigate = useNavigate();

  // Sync activeTab with route if needed (optional, for future route-based tabs)
  useEffect(() => {
    // Example: if you want to sync tab with route, implement here
    // For now, keep as is
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await api.get(`/dashboard/manager?period=${selectedPeriod}`);
        setDashboardData(dashboardRes.data?.data || {});
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  // General tab cards (8 cards, 2 rows)
  const generalCards = [
    {
      title: 'Sales Transactions',
      value: dashboardData.SalesTransactions ?? 0,
      chartData: [50, dashboardData.SalesTransactions ?? 84, 70, 75, 60, 55, 53],
    },
    {
      title: 'Net Sales (SAR)',
      value: dashboardData.NetSales ? dashboardData.NetSales.toFixed(2) : '0.00',
      chartData: [50, 65, dashboardData.NetSales ?? 90, 75, 60, 55, 53],
    },
    {
      title: 'Gross Profit (SAR)',
      value: dashboardData.GrossProfit ? dashboardData.GrossProfit.toFixed(2) : '0.00',
      chartData: [50, 65, 70, dashboardData.GrossProfit ?? 100, 60, 55, 53],
    },
    {
      title: 'Discount Amount (SAR)',
      value: dashboardData.DiscountAmount ? dashboardData.DiscountAmount.toFixed(2) : '0.00',
      chartData: [50, 40, dashboardData.DiscountAmount ?? 10, 8, 6, 3, 2],
    },
    {
      title: 'Return Amount (SAR)',
      value: dashboardData.ReturnAmount ? dashboardData.ReturnAmount.toFixed(2) : '0.00',
      chartData: [10, 12, dashboardData.ReturnAmount ?? 5, 8, 6, 3, 2],
    },
    {
      title: 'Average Transaction Value (SAR)',
      value:
        dashboardData.AverageTransactionValue
          ? dashboardData.AverageTransactionValue.toFixed(2)
          : (
              (dashboardData.NetSales || 0) /
                (dashboardData.SalesTransactions || 1)
            ).toFixed(2),
      chartData: [20, 22, 21, 23, 24, 25, 26],
    },
    {
      title: 'Sales Growth Rate (%)',
      value: 5.2,
      chartData: [2, 3, 4, 5, 5.2, 5, 4.8],
    },
    {
      title: 'Operational Efficiency Ratio (%)',
      value: 85,
      chartData: [80, 82, 83, 84, 85, 85, 85],
    },
  ];

  // Inventory tab cards (first row: 4 line charts, mock data)
  const inventoryLineCards = [
    {
      title: 'Low Stock Count',
      value: 5,
      chartData: [10, 15, 12, 8, 5, 3, 2],
    },
    {
      title: 'Stock Turnover Rate',
      value: 5.2,
      chartData: [4, 5, 6, 5, 4, 3, 2],
    },
    {
      title: 'Overstock Alert',
      value: 3,
      chartData: [2, 3, 4, 3, 2, 1, 0],
    },
    {
      title: 'Average Stock Age (Days)',
      value: 15,
      chartData: [20, 18, 16, 15, 14, 13, 12],
    },
  ];

  // Pie chart for Stock Value
  const stockValuePieData = {
    labels: ['Dairy', 'Beverages', 'Produce', 'Others'],
    datasets: [
      {
        data: [4000, 3500, 4500, 3000],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart for Restock Frequency
  const restockBarData = {
    labels: ['Milk', 'Eggs', 'Bread', 'Butter', 'Juice'],
    datasets: [
      {
        label: 'Restock Frequency',
        data: [2, 3, 2.5, 2.2, 2.8],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderRadius: 6,
      },
    ],
  };

  const restockBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: false } },
      y: { title: { display: false }, ticks: { display: false } },
    },
    maintainAspectRatio: false,
  };

  // Table for Top Slow-Moving Products
  const slowMovingProducts = [
    { name: 'Canned Peas', velocity: '5 units/month' },
    { name: 'Jar Honey', velocity: '3 units/month' },
    { name: 'Olive Oil', velocity: '2 units/month' },
    { name: 'Spices Set', velocity: '1 unit/month' },
    { name: 'Tea Bags', velocity: '0.5 units/month' },
  ];

  // Chart config for all cards
  const getLineChartData = (dataArr) => ({
    labels: ['Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020', 'Jan 2021'],
    datasets: [
      {
        label: '',
        data: dataArr,
        fill: true,
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(142, 68, 173, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: false } },
      y: { title: { display: false }, ticks: { display: false } },
    },
    maintainAspectRatio: false,
  };

  // Hourly sales chart (mock data)
  const hourlySalesData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Hourly Sales',
        data: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30],
        fill: true,
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(142, 68, 173, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0,
      },
    ],
  };

  const hourlyChartOptions = {
    ...chartOptions,
    scales: {
      x: { title: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
      y: { title: { display: false }, ticks: { display: false } },
    },
  };

  // Mock data for new sections
  const topProducts = [
    { name: 'Ayran Laban 180ml', netSales: 1200.50 },
    { name: 'Milk 1L', netSales: 950.75 },
    { name: 'Cheese 200g', netSales: 800.00 },
    { name: 'Yogurt 500g', netSales: 650.25 },
    { name: 'Butter 250g', netSales: 500.10 },
  ];

  const topPayments = [
    { method: 'Cash', netIncome: 3829.22 },
    { method: 'Card', netIncome: 2895.26 },
    { method: 'Apple Pay', netIncome: 1200.00 },
    { method: 'Google Pay', netIncome: 950.00 },
    { method: 'Voucher', netIncome: 500.00 },
  ];

  const topCategories = [
    { category: 'Dairy', volume: 500 },
    { category: 'Beverages', volume: 300 },
    { category: 'Bakery', volume: 250 },
    { category: 'Snacks', volume: 200 },
    { category: 'Produce', volume: 150 },
  ];

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
    <div className="flex min-h-screen bg-gray-100">
      <Header />
      <Sidebar role={role} />
      <div className="flex-1">
        {/* New Section: Welcome + Tabs */}
        <div
          className="bg-white shadow-md p-4 border-b border-gray-200 z-10 mt-0"
          style={{ marginLeft: '16rem', marginTop: '4rem' }}
        >
          <div>
            <div className="text-gray-800 font-semibold mb-2 text-2xl">
              Welcome, {username}
            </div>
            <div className="flex space-x-8">
              <button
                className={`text-gray-800 hover:text-gray-600 pb-2 transition-all ${
                  activeTab === 'General'
                    ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                    : 'border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('General')}
              >
                General
              </button>
              <button
                className={`text-gray-800 hover:text-gray-600 pb-2 transition-all ${
                  activeTab === 'Inventory'
                    ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                    : 'border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('Inventory')}
              >
                Inventory
              </button>
            </div>
          </div>
        </div>
        {/* Filter Section */}
        <div className="flex justify-end bg-white p-4 border-b border-gray-100" style={{ marginLeft: '16rem' }}>
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
        {/* Main Content */}
        <main className="mt-8 ml-64 p-6">
          {activeTab === 'General' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {generalCards.slice(0, 4).map((card) => (
                  <div key={card.title} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-lg font-sans text-gray-700 mb-2">{card.title}</h2>
                    <p className="text-3xl font-bold mb-4">{card.value}</p>
                    <div className="h-24">
                      <LineChart data={getLineChartData(card.chartData)} options={chartOptions} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {generalCards.slice(4, 8).map((card) => (
                  <div key={card.title} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-lg font-sans text-gray-700 mb-2">{card.title}</h2>
                    <p className="text-3xl font-bold mb-4">{card.value}</p>
                    <div className="h-24">
                      <LineChart data={getLineChartData(card.chartData)} options={chartOptions} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md w-full mb-6">
                <h2 className="text-lg font-sans text-gray-700 mb-2">Hourly Sales</h2>
                <div className="h-48">
                  <LineChart data={hourlySalesData} options={hourlyChartOptions} />
                </div>
              </div>
              {/* New 3-column sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Products by Net Sales */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Products by Net Sales</h3>
                  <ul>
                    {topProducts.map((item, idx) => (
                      <li key={item.name} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.name}</span>
                        <span className="font-mono text-gray-600">{item.netSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Top Payment by Net Income */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Payment by Net Income</h3>
                  <ul>
                    {topPayments.map((item, idx) => (
                      <li key={item.method} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.method}</span>
                        <span className="font-mono text-gray-600">{item.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Top Categories by Sales Volume */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Categories by Sales Volume</h3>
                  <ul>
                    {topCategories.map((item, idx) => (
                      <li key={item.category} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.category}</span>
                        <span className="font-mono text-gray-600">{item.volume} units</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          {activeTab === 'Inventory' && (
            <>
              {/* Row 1: 4 line chart cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {inventoryLineCards.map((card) => (
                  <div key={card.title} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-lg font-sans text-gray-700 mb-2">{card.title}</h2>
                    <p className="text-3xl font-bold mb-4">{card.value}</p>
                    <div className="h-24">
                      <LineChart
                        data={getLineChartData(card.chartData)}
                        options={chartOptions}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Row 2: Pie, Bar, Table */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Value (SAR)</h2>
                  <p className="text-3xl font-bold mb-4">15,000</p>
                  <div className="h-48 flex items-center justify-center">
                    <PieChart data={stockValuePieData} />
                  </div>
                </div>
                {/* Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Restock Frequency (Times/Month)</h2>
                  <p className="text-3xl font-bold mb-4">2.5</p>
                  <div className="h-48 flex items-center justify-center">
                    <BarChart data={restockBarData} options={restockBarOptions} />
                  </div>
                </div>
                {/* Table */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Top Slow-Moving Products</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 font-semibold text-gray-700">Product Name</th>
                          <th className="py-2 px-2 font-semibold text-gray-700">Sales Velocity (units/month)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slowMovingProducts.map((item) => (
                          <tr key={item.name} className="border-b last:border-b-0">
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2">{item.velocity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;