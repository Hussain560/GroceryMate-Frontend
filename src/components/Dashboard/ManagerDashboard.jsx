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

  // Set default period and date on initial render
  useEffect(() => {
    setSelectedPeriod('day');
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Unified fetch for both overview and inventory metrics (live data)
  useEffect(() => {
    const fetchData = async () => {
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
        if (selectedStockFilter !== 'All Time') params.append('stockFilter', selectedStockFilter);

        const [overviewResponse, metricsResponse] = await Promise.all([
          api.get(`/dashboard/overview?${params.toString()}`),
          api.get(`/inventory/metrics?${params.toString()}`)
        ]);
        setDashboardData(overviewResponse.data?.data || {});
        setInventoryData(metricsResponse.data?.data || {});
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [selectedPeriod, date, selectedYear, selectedMonth, startDate, endDate, selectedStockFilter]);

  // Enhanced dynamic labels for charts
  function getDynamicLabels() {
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
      // Daily labels if ≤ 31 days
      if (diffDays <= 31) {
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
      }
      // Monthly labels if > 31 days and ≤ 12 months
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
      // Yearly labels if > 12 months
      if (diffDays > 366) {
        const years = [];
        for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
          years.push(`${y}`);
        }
        return years;
      }
    }
    // Default fallback
    return ['Label1', 'Label2', 'Label3', 'Label4', 'Label5', 'Label6', 'Label7'];
  }

  // Update getLineChartData to use API data directly
  const getLineChartData = (metric) => ({
    labels: getDynamicLabels(),
    datasets: [
      {
        label: '',
        data: dashboardData[metric] || [],
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

  // Move generalCards definition above the return statement
  const generalCards = [
    {
      title: 'Sales Transactions',
      value: dashboardData.SalesTransactions || 0,
      metric: 'SalesTransactionsHistory'
    },
    {
      title: 'Net Sales (SAR)',
      value: (dashboardData.NetSales || 0).toFixed(2),
      metric: 'NetSalesHistory'
    },
    {
      title: 'Gross Profit (SAR)',
      value: (dashboardData.GrossProfit || 0).toFixed(2),
      metric: 'GrossProfitHistory'
    },
    {
      title: 'Discount Amount (SAR)',
      value: (dashboardData.DiscountAmount || 0).toFixed(2),
      metric: 'DiscountAmountHistory'
    },
    {
      title: 'Return Amount (SAR)',
      value: (dashboardData.ReturnAmount || 0).toFixed(2),
      metric: 'ReturnAmountHistory'
    },
    {
      title: 'Average Transaction Value (SAR)',
      value: (dashboardData.AverageTransactionValue || 0).toFixed(2),
      metric: 'AverageTransactionValueHistory'
    },
    {
      title: 'Sales Growth Rate (%)',
      value: (dashboardData.SalesGrowthRate || 0).toFixed(2),
      metric: 'SalesGrowthRateHistory'
    },
    {
      title: 'Operational Efficiency Ratio (%)',
      value: (dashboardData.OperationalEfficiencyRatio || 0).toFixed(2),
      metric: 'OperationalEfficiencyRatioHistory'
    },
  ].map(card => ({
    ...card,
    chartData: getLineChartData(card.metric)
  }));

  // Add inventoryLineCards definition above the return statement
  const inventoryLineCards = [
    {
      title: 'Low Stock Count',
      value: dashboardData.LowStockCount || 5,
      chartData: getLineChartData('LowStockCountHistory'),
    },
    {
      title: 'Stock Turnover Rate',
      value: dashboardData.StockTurnoverRate || 5.2,
      chartData: getLineChartData('StockTurnoverRateHistory'),
    },
    {
      title: 'Overstock Alert',
      value: dashboardData.OverstockAlert || 3,
      chartData: getLineChartData('OverstockAlertHistory'),
    },
    {
      title: 'Average Stock Age (Days)',
      value: dashboardData.AverageStockAge || 15,
      chartData: getLineChartData('AverageStockAgeHistory'),
    },
  ];

  // Pie chart data for stock value
  const stockValueByCategory = inventoryData.stockValueByCategory ?? [
    { label: 'Dairy', value: 5000 },
    { label: 'Beverages', value: 3500 },
    { label: 'Produce', value: 4500 },
    { label: 'Others', value: 3000 },
  ];
  const stockValuePieData = {
    labels: stockValueByCategory.map(c => c.label),
    datasets: [
      {
        data: stockValueByCategory.map(c => c.value),
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for restock frequency
  const restockTrend = inventoryData.restockTrend ?? [2, 2.5, 3];
  const restockLabels = ['Apr', 'May', 'Jun'];
  const restockBarData = {
    labels: restockLabels,
    datasets: [
      {
        label: 'Restock Frequency',
        data: restockTrend,
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
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

  // Inventory metrics (mock fallback if API missing fields)
  const lowStockCount = inventoryData.lowStockCount ?? 10;
  const totalProducts = inventoryData.totalProducts ?? 200;
  const lowStockPercent = totalProducts ? Math.round((lowStockCount / totalProducts) * 100) : 5;
  const turnoverRate = inventoryData.turnoverRate ?? 2.5;
  const turnoverTrend = inventoryData.turnoverTrend ?? 10; // up 10%
  const overstockCount = inventoryData.overstockCount ?? 5;
  const overstockSeverity = inventoryData.overstockSeverity ?? '>3 months';
  const avgStockAge = inventoryData.avgStockAge ?? 45;
  const avgStockAgeRange = inventoryData.avgStockAgeRange ?? [30, 60];
  const slowMovingProducts = inventoryData.slowMovingProducts ?? [
    { name: 'Canned Peas', lastSold: '2024-05-01', expiry: '2024-07-01' },
    { name: 'Jar Honey', lastSold: '2024-04-15', expiry: '2024-09-01' },
    { name: 'Olive Oil', lastSold: '2024-03-20', expiry: '2024-08-15' },
    { name: 'Spices Set', lastSold: '2024-02-10', expiry: '2024-07-30' },
    { name: 'Tea Bags', lastSold: '2024-01-05', expiry: '2024-06-10' },
  ];
  const outageRiskCount = inventoryData.outageRiskCount ?? 3;
  const expiredValue = inventoryData.expiredValue ?? 1000;

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

  // Show message if data is empty for the selected tab
  const isSalesTab = activeTab === 'Sales';
  const isInventoryTab = activeTab === 'Inventory';
  const isSalesEmpty =
    isSalesTab &&
    (!dashboardData || Object.keys(dashboardData).length === 0 ||
      Object.values(dashboardData).every(
        v => v === null || v === undefined || (Array.isArray(v) && v.length === 0)
      ));
  const isInventoryEmpty =
    isInventoryTab &&
    (!inventoryData || Object.keys(inventoryData).length === 0 ||
      Object.values(inventoryData).every(
        v => v === null || v === undefined || (Array.isArray(v) && v.length === 0)
      ));

  if (isSalesEmpty || isInventoryEmpty) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-4">No Data Available</h2>
          <p className="text-gray-700">
            {isSalesTab
              ? 'No sales data found for the selected filters.'
              : 'No inventory data found for the selected filters.'}
          </p>
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

        {/* Filter Section with Date Inputs and Day Picker */}
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

        {/* Filter Section with Stock Age Range */}
        <div className="bg-white p-4 border-b border-gray-100 mt-0 ml-64 flex flex-wrap justify-between items-center relative">
          <div className="flex space-x-4">
            {/* ...existing Day, Week, Month, Custom buttons and selectors... */}
          </div>
          {/* Stock Age Range Filter */}
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
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

        {/* Main Content */}
        <main className="p-6 mt-20 ml-64">
          {activeTab === 'General' && (
            <>
              {/* 8 Cards: 2 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {generalCards.map((card) => (
                  <div key={card.title} className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-sans text-gray-700 mb-2">{card.title}</h2>
                    <p className="text-3xl font-bold mb-4">{card.value}</p>
                    <div className="h-24">
                      <LineChart data={getLineChartData(card.metric)} options={chartOptions} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Conditionally render Hourly Sales chart for "day" period */}
              {selectedPeriod === 'day' && (
                <div className="bg-white p-4 rounded-lg shadow-md w-full mb-6">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Hourly Sales</h2>
                  <div className="h-48">
                    <LineChart data={getLineChartData('HourlySales')} options={chartOptions} />
                  </div>
                </div>
              )}
              {/* New 3-column sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Products by Net Sales */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Products by Net Sales</h3>
                  <ul>
                    {(dashboardData.TopProducts || []).slice(0, 5).map((product, idx) => (
                      <li key={product.id || idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">
                          {idx + 1}. {product.name || product.ProductName || ''}
                        </span>
                        <span className="font-mono text-gray-600">
                          {(product.netSales || product.NetSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Top Payment by Net Income */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Payment by Net Income</h3>
                  <ul>
                    {(dashboardData.TopPayments || []).slice(0, 5).map((item, idx) => (
                      <li key={item.id || idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.method || item.PaymentMethod || ''}</span>
                        <span className="font-mono text-gray-600">{(item.netIncome || item.NetIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Top Categories by Sales Volume */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Categories by Sales Volume</h3>
                  <ul>
                    {(dashboardData.TopCategories || []).slice(0, 5).map((item, idx) => (
                      <li key={item.id || idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.category || item.CategoryName || ''}</span>
                        <span className="font-mono text-gray-600">{(item.volume || item.SalesVolume || 0)} units</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          {activeTab === 'Inventory' && (
            <>
              {/* Row 1: 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Low Stock Count */}
                <div className={`bg-white p-4 rounded-lg shadow-md flex flex-col ${lowStockPercent > 10 ? 'border border-red-500' : ''}`}>
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Low Stock Count</h2>
                  <p className={`text-3xl font-bold mb-2 ${lowStockPercent > 10 ? 'text-red-500' : 'text-gray-800'}`}>
                    {lowStockCount} ({lowStockPercent}%)
                  </p>
                  <span className="text-sm text-gray-500">of {totalProducts} products</span>
                </div>
                {/* Stock Turnover Rate */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Turnover Rate</h2>
                  <p className="text-3xl font-bold mb-2 text-green-600">{turnoverRate}x</p>
                  <span className="text-sm text-green-500">up {turnoverTrend}%</span>
                </div>
                {/* Overstock Alert */}
                <div className={`bg-white p-4 rounded-lg shadow-md flex flex-col ${overstockSeverity === '>3 months' ? 'border border-yellow-500' : ''}`}>
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Overstock Alert</h2>
                  <p className={`text-3xl font-bold mb-2 ${overstockSeverity === '>3 months' ? 'text-yellow-600' : 'text-gray-800'}`}>
                    {overstockCount} ({overstockSeverity})
                  </p>
                  <span className="text-sm text-gray-500">items overstocked</span>
                </div>
              </div>
              {/* Row 2: 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Average Stock Age */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Average Stock Age (Days)</h2>
                  <p className="text-3xl font-bold mb-2">{avgStockAge}</p>
                  <span className="text-sm text-gray-500">({avgStockAgeRange[0]}-{avgStockAgeRange[1]} days)</span>
                </div>
                {/* Stock Value Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Value (SAR)</h2>
                  <p className="text-3xl font-bold mb-4">{stockValueByCategory.reduce((sum, c) => sum + c.value, 0).toLocaleString()} SAR</p>
                  <div className="h-48 flex items-center justify-center">
                    <PieChart data={stockValuePieData} />
                  </div>
                </div>
                {/* Restock Frequency Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Restock Frequency (Times/Month)</h2>
                  <p className="text-3xl font-bold mb-4">{restockTrend[restockTrend.length - 1]}</p>
                  <div className="h-48 flex items-center justify-center">
                    <BarChart data={restockBarData} options={restockBarOptions} />
                  </div>
                </div>
              </div>
              {/* Row 3: 1 list and 2 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Slow-Moving Products List */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Top Slow-Moving Products</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 font-semibold text-gray-700">Product Name</th>
                          <th className="py-2 px-2 font-semibold text-gray-700">Last Sold Date</th>
                          <th className="py-2 px-2 font-semibold text-gray-700">Expiration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slowMovingProducts.map((item) => (
                          <tr key={item.name} className="border-b last:border-b-0">
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2">{item.lastSold}</td>
                            <td className="py-2 px-2">{item.expiry}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Stock Outage Risk */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Stock Outage Risk</h2>
                  <p className="text-3xl font-bold text-red-500 mb-2">{outageRiskCount} items</p>
                  <span className="text-sm text-gray-500">at risk of outage</span>
                </div>
                {/* Expired Stock Value */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Expired Stock Value</h2>
                  <p className="text-3xl font-bold text-red-600 mb-2">{expiredValue} SAR</p>
                  <span className="text-sm text-gray-500">total expired stock</span>
                </div>
              </div>
            </>
          )}
          {/* Sales Tab */}
          {activeTab === 'Sales' && (
            <>
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Net Sales (SAR)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.NetSales ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Gross Profit (SAR)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.GrossProfit ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Discount Amount (SAR)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.DiscountAmount ?? 0).toLocaleString()}</p>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Return Amount (SAR)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.ReturnAmount ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Average Transaction Value (SAR)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.AverageTransactionValue ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Sales Growth Rate (%)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.SalesGrowthRate ?? 0).toLocaleString()}%</p>
                </div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Operational Efficiency Ratio (%)</h2>
                  <p className="text-3xl font-bold mb-2">{(dashboardData.OperationalEfficiencyRatio ?? 0).toLocaleString()}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Hourly Sales</h2>
                  <div className="h-48">
                    <LineChart data={hourlySalesLineData} options={chartOptions} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h2 className="text-lg font-sans text-gray-700 mb-2">Top Products by Net Sales</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 font-semibold text-gray-700">Product Name</th>
                          <th className="py-2 px-2 font-semibold text-gray-700">Net Sales (SAR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.TopProductsByNetSales || []).map((item) => (
                          <tr key={item.ProductName} className="border-b last:border-b-0">
                            <td className="py-2 px-2">{item.ProductName}</td>
                            <td className="py-2 px-2">{(item.NetSales ?? 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Below Sales Tab: Top Payment by Net Income and Top Categories by Sales Volume */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Payment by Net Income */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Payment by Net Income</h3>
                  <ul>
                    {(dashboardData.TopPaymentByNetIncome || []).map((item, idx) => (
                      <li key={item.PaymentMethod || idx} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="font-sans text-gray-800">{idx + 1}. {item.PaymentMethod || ''}</span>
                        <span className="font-mono text-gray-600">{(item.NetIncome ?? 0).toLocaleString()} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Top Categories by Sales Volume */}
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Top Categories by Sales Volume</h3>
                  <div className="h-48 flex items-center justify-center">
                    <BarChart data={topCategoriesBarData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ...existing code... */}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;