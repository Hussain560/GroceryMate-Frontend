import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import LineChart from './Charts/LineChart';
import PieChart from './Charts/PieChart';
import BarChart from './Charts/BarChart';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const ManagerDashboard = () => {
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('General');
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [inventoryData, setInventoryData] = useState({});
  const [selectedStockFilter, setSelectedStockFilter] = useState('All Time');

  const fullName = localStorage.getItem('fullName') || 'Manager';
  const role = localStorage.getItem('role') || 'Manager';

  // Ref for day picker for outside click
  const dayPickerRef = useRef(null);

  // Close day picker on outside click
  useEffect(() => {
    if (!isDayPickerOpen) return;
    const handleClickOutside = (event) => {
      if (dayPickerRef.current && !dayPickerRef.current.contains(event.target)) {
        setIsDayPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDayPickerOpen]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('period', selectedPeriod);
        if (selectedPeriod === 'day') params.append('date', date);
        if (selectedPeriod === 'month') {
          params.append('year', selectedYear);
          params.append('month', selectedMonth);
        }
        if (selectedPeriod === 'custom') {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        }
        if (selectedStockFilter !== 'All Time') {
          params.append('stockFilter', selectedStockFilter);
        }

        console.log('Fetching dashboard data with params:', params.toString());

        const response = await api.get(`/dashboard/overview?${params.toString()}`);
        console.log('Dashboard data:', response.data);
        
        if (response.data?.success) {
          setDashboardData(response.data.data || {});
        } else {
          throw new Error(response.data?.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, date, selectedYear, selectedMonth, startDate, endDate, selectedStockFilter]);

  // Helper function to process history data
  const processHistoryData = (historyArray) => {
    if (!Array.isArray(historyArray) || historyArray.length === 0) {
      return { labels: [], data: [] };
    }

    const labels = historyArray.map(item => 
      item.date || item.hour || item.month || item.year || 'N/A'
    );
    const data = historyArray.map(item => item.value || 0);

    return { labels, data };
  };

  // Helper function to create chart data for metrics
  const createMetricChartData = (historyArray, label, color = 'rgba(142, 68, 173, 1)') => {
    const { labels, data } = processHistoryData(historyArray);
    
    return {
      labels,
      datasets: [{
        label,
        data,
        fill: true,
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        borderColor: color,
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0,
      }]
    };
  };

  // Helper function for chart data
  const getLineChartData = (metric) => {
    const getColor = () => 'rgba(142, 68, 173, 1)';
    const getBgColor = () => 'rgba(142, 68, 173, 0.2)';

    if (metric === 'HourlySales') {
      const hourlyData = dashboardData.HourlySales || Array(24).fill({ Hour: 0, Amount: 0 });
      return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Sales Amount',
          data: hourlyData.map(h => h.Amount),
          fill: true,
          backgroundColor: getBgColor(),
          borderColor: getColor(),
          borderWidth: 2,
          pointStyle: 'circle',
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: getColor(),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
        }]
      };
    }

    // For other metrics, just return the current value
    return {
      labels: [new Date().toLocaleDateString()],
      datasets: [{
        label: metric,
        data: [dashboardData[metric] || 0],
        fill: true,
        backgroundColor: getBgColor(),
        borderColor: getColor(),
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: getColor(),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    };
  };

  // Helper for dynamic labels based on selectedPeriod
  const getDynamicLabels = () => {
    if (selectedPeriod === 'day') {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    }
    if (selectedPeriod === 'week') {
      return Array.from({ length: 7 }, (_, i) =>
        new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );
    }
    if (selectedPeriod === 'month') {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) =>
        `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${(i + 1)
          .toString()
          .padStart(2, '0')}`
      );
    }
    if (selectedPeriod === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) {
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
      }
      if (diffDays > 31 && diffDays <= 366) {
        const months = [];
        let d = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        while (d <= endMonth) {
          months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
          d.setMonth(d.getMonth() + 1);
        }
        return months;
      }
      if (diffDays > 366) {
        const years = [];
        for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
          years.push(`${y}`);
        }
        return years;
      }
    }
    return ['Label1', 'Label2', 'Label3', 'Label4', 'Label5', 'Label6', 'Label7'];
  };

  // Helper for general metric trends (use API trend/history if available, else fallback to flat array)
  const getMetricTrend = (metric, fallbackValue) => {
    // If API provides *_History or *_Trend array, use it
    if (Array.isArray(dashboardData[`${metric}History`]) && dashboardData[`${metric}History`].length > 0) {
      return dashboardData[`${metric}History`];
    }
    if (Array.isArray(dashboardData[`${metric}Trend`]) && dashboardData[`${metric}Trend`].length > 0) {
      return dashboardData[`${metric}Trend`];
    }

    // If period is 'day', use the single value for the day
    if (selectedPeriod === 'day') {
      return [Number(fallbackValue)];
    }

    // If period is 'week' or 'month', interpolate the value across the period
    const labels = getDynamicLabels();
    // For week/month, try to interpolate using HourlySales if available and metric is NetSales/GrossProfit
    if (
      (metric === 'NetSales' || metric === 'GrossProfit') &&
      Array.isArray(dashboardData.HourlySales) &&
      dashboardData.HourlySales.length > 0
    ) {
      // Sum up HourlySales for each day if possible (for week/month)
      // But since API only gives HourlySales for the current period, fallback to flat
      return Array(labels.length).fill(Number(fallbackValue));
    }

    // Fallback: flat array with the current value
    return Array(labels.length).fill(Number(fallbackValue));
  };

  // General cards config with updated metrics
  const generalCards = [
    {
      title: 'Sales Transactions',
      value: dashboardData.SalesTransactions || 0,
      historyKey: 'SalesTransactionsHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Net Sales (SAR)',
      value: (dashboardData.NetSales || 0).toFixed(2),
      historyKey: 'NetSalesHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Gross Profit (SAR)',
      value: (dashboardData.GrossProfit || 0).toFixed(2),
      historyKey: 'GrossProfitHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Discount Amount (SAR)',
      value: (dashboardData.DiscountAmount || 0).toFixed(2),
      historyKey: 'DiscountAmountHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Return Amount (SAR)',
      value: (dashboardData.ReturnAmount || 0).toFixed(2),
      historyKey: 'ReturnAmountHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Average Transaction Value (SAR)',
      value: (dashboardData.AverageTransactionValue || 0).toFixed(2),
      historyKey: 'AverageTransactionValueHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Sales Growth Rate (%)',
      value: (dashboardData.SalesGrowthRate || 0).toFixed(2),
      historyKey: 'SalesGrowthRateHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
    {
      title: 'Operational Efficiency (%)',
      value: (dashboardData.OperationalEfficiencyRatio || 0).toFixed(2),
      historyKey: 'OperationalEfficiencyRatioHistory',
      color: 'rgba(142, 68, 173, 1)',
    },
  ];

  // General card chart options (straight line, lilac color)
  const cardChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    elements: {
      line: { tension: 0 },
      point: { radius: 5, hoverRadius: 7, pointStyle: 'circle' }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  // Chart options for hourly sales chart
  const hourlySalesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()} SAR`
        }
      }
    },
    elements: {
      line: { tension: 0 },
      point: { radius: 5, hoverRadius: 7, pointStyle: 'circle' }
    },
    scales: {
      x: {
        grid: { display: true },
        ticks: { maxRotation: 45, minRotation: 45, maxTicksLimit: 12 }
      },
      y: {
        grid: { display: true },
        ticks: { 
          display: true,
          callback: (value) => `${value.toLocaleString()} SAR`
        },
        beginAtZero: true
      }
    }
  };

  // Create hourly sales chart data
  const createHourlySalesChartData = () => {
    const hourlySales = dashboardData.HourlySales || [];
    const labels = hourlySales.map(h => `${h.Hour || 0}:00`);
    const data = hourlySales.map(h => h.Amount || 0);

    return {
      labels,
      datasets: [{
        label: 'Sales Amount',
        data,
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
      }]
    };
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Header />
        <Sidebar role={role} />
        <div className="flex-1 mt-16 ml-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Header />
        <Sidebar role={role} />
        <div className="flex-1 mt-16 ml-64 p-6">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Header />
      <Sidebar role={role} />
      <div className="flex-1">
        {/* Welcome + Tabs */}
        <div className="bg-white shadow-md p-4 border-b border-gray-200 z-10 mt-16 ml-64">
          <div>
            <div className="text-gray-800 font-semibold mb-2 text-2xl">
              Welcome, {fullName}
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
        <div className="bg-white p-4 border-b border-gray-100 mt-0 ml-64 flex justify-between items-center relative">
          <div className="flex space-x-4">
            {/* Day Button with Calendar */}
            <div className="relative">
              <button
                className={`px-4 py-2 mr-2 rounded relative ${
                  selectedPeriod === 'day' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
                }`}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedPeriod('day');
                  setIsDayPickerOpen(true);
                  setIsMonthSelectorOpen(false);
                }}
              >
                Day
              </button>
              {selectedPeriod === 'day' && isDayPickerOpen && (
                <div
                  ref={dayPickerRef}
                  className="absolute left-0 mt-2 bg-white shadow-lg rounded p-2 z-10"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={e => {
                        setDate(e.target.value);
                        setIsDayPickerOpen(false);
                      }}
                      className="mr-2 p-2 border rounded"
                    />
                    <button
                      className="cursor-pointer text-gray-500 hover:text-gray-700 px-2"
                      onClick={() => setIsDayPickerOpen(false)}
                      title="Close"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Week Button */}
            <button
              className={`px-4 py-2 mr-2 rounded ${
                selectedPeriod === 'week' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
              }`}
              onClick={() => {
                setSelectedPeriod('week');
                setIsDayPickerOpen(false);
                setIsMonthSelectorOpen(false);
              }}
            >
              Week
            </button>

            {/* Month Button with selector */}
            <div className="relative">
              <button
                className={`px-4 py-2 mr-2 rounded relative ${
                  selectedPeriod === 'month' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
                }`}
                onClick={() => {
                  setSelectedPeriod('month');
                  setIsMonthSelectorOpen((open) => !open);
                  setIsDayPickerOpen(false);
                }}
              >
                Month
              </button>
              {selectedPeriod === 'month' && isMonthSelectorOpen && (
                <div className="absolute left-0 mt-2 bg-white shadow-lg rounded p-4 z-10 flex flex-col space-y-2 w-80">
                  <div className="mb-2">
                    <label className="text-sm text-gray-700 mb-1 block">Year</label>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      className="p-2 border rounded w-full"
                    >
                      {[2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Month</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                      ].map((label, idx) => (
                        <button
                          key={label}
                          type="button"
                          className={`rounded px-0 py-2 text-center border transition-colors ${
                            selectedMonth === idx + 1
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100'
                          }`}
                          onClick={() => setSelectedMonth(idx + 1)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    className="mt-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => setIsMonthSelectorOpen(false)}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>

            {/* Custom Button */}
            <button
              className={`px-4 py-2 rounded ${
                selectedPeriod === 'custom' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'
              }`}
              onClick={() => {
                setSelectedPeriod('custom');
                setIsDayPickerOpen(false);
                setIsMonthSelectorOpen(false);
              }}
            >
              Custom
            </button>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border rounded"
                max={endDate}
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border rounded"
                min={startDate}
              />
            </div>
          )}
        </div>

        {/* Stock Age Filter for Inventory tab */}
        {activeTab === 'Inventory' && (
          <div className="bg-white p-4 border-b border-gray-100 mt-0 ml-64 flex justify-end">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 font-medium">Stock Age Range:</label>
              <select
                value={selectedStockFilter}
                onChange={e => setSelectedStockFilter(e.target.value)}
                className="p-2 border rounded"
              >
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>30-60 Days</option>
                <option>60-90 Days</option>
                <option>Near Expiry (&lt;30 Days)</option>
                <option>Expired</option>
              </select>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-6 mt-0 ml-64">
          {activeTab === 'General' && (
            <>
              {/* 8 KPI Cards with LineChart */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {generalCards.map((card, idx) => {
                  const historyData = dashboardData[card.historyKey] || [];
                  const chartData = createMetricChartData(historyData, card.title, card.color);
                  
                  return (
                    <div key={card.title} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                      <h2 className="text-lg font-sans text-gray-700 mb-2">{card.title}</h2>
                      <p className="text-3xl font-bold mb-2">{card.value}</p>
                      <div className="h-32">
                        <LineChart
                          data={chartData}
                          options={cardChartOptions}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hourly Sales Chart (full width) */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-sans text-gray-700 mb-4">Hourly Sales</h2>
                <div className="h-64">
                  <LineChart
                    data={createHourlySalesChartData()}
                    options={hourlySalesChartOptions}
                  />
                </div>
              </div>

              {/* Summary Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Products */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-4">Top Products by Net Sales</h2>
                  <ul>
                    {(dashboardData.TopProductsByNetSales || []).map((product, idx) => (
                      <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{product.ProductName}</span>
                        <span className="font-mono text-gray-600">{product.Total.toLocaleString()} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top Payment Methods */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-4">Top Payment Methods</h2>
                  <ul>
                    {(dashboardData.TopPaymentByNetIncome || []).map((payment, idx) => (
                      <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{payment.PaymentMethod}</span>
                        <span className="font-mono text-gray-600">{payment.Total.toLocaleString()} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top Categories */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-4">Top Categories by Sales Volume</h2>
                  <ul>
                    {(dashboardData.TopCategoriesBySalesVolume || []).map((category, idx) => (
                      <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{category.CategoryName}</span>
                        <span className="font-mono text-gray-600">{category.Volume} units</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Inventory' && (
            <>
              {/* Row 1: 3-column metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Low Stock Count</h2>
                  <p className="text-3xl font-bold">{dashboardData.LowStockCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Turnover Rate</h2>
                  <p className="text-3xl font-bold">{(dashboardData.TurnoverRate || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Overstock Count</h2>
                  <p className="text-3xl font-bold">{dashboardData.OverstockCount || 0}</p>
                </div>
              </div>

              {/* Row 2: Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Average Stock Age (Days)</h2>
                  <p className="text-3xl font-bold">{(dashboardData.AvgStockAge || 0).toFixed(1)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Value by Category</h2>
                  <div className="h-64">
                    <PieChart 
                      data={{
                        labels: Object.keys(dashboardData.StockValue || {}),
                        datasets: [{
                          data: Object.values(dashboardData.StockValue || {}),
                          backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF99CC', '#00CC99'
                          ]
                        }]
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Restock Frequency</h2>
                  <p className="text-3xl font-bold">{dashboardData.RestockFrequency || 0}</p>
                </div>
              </div>

              {/* Row 3: Table and KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md md:col-span-1">
                  <h2 className="text-lg font-sans text-gray-700 mb-4">Top Slow-Moving Products</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 text-left border-b">Product Name</th>
                          <th className="py-2 px-2 text-left border-b">Last Sold</th>
                          <th className="py-2 px-2 text-left border-b">Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.TopSlowMovingProducts || []).map((product, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2 px-2 border-b">{product.ProductName}</td>
                            <td className="py-2 px-2 border-b">
                              {product.LastSoldDate ? new Date(product.LastSoldDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-2 px-2 border-b">
                              {product.ExpirationDate ? new Date(product.ExpirationDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Outage Risk</h2>
                  <p className="text-3xl font-bold text-red-500">{dashboardData.OutageRiskCount || 0} items</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Expired Stock Value</h2>
                  <p className="text-3xl font-bold text-red-600">{(dashboardData.ExpiredValue || 0).toLocaleString()} SAR</p>
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
