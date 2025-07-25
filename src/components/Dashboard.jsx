import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../api/api';
import { getUserRole } from '../utils/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = getUserRole();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const endpoint = userRole === 'Manager' ? '/dashboard/manager' : '/dashboard/employee';
      const { data } = await api.get(endpoint);
      setMetrics(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {userRole === 'Manager' ? 'Manager Dashboard' : 'Dashboard'}
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts}
          icon="fas fa-box"
          color="blue"
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics?.lowStockCount}
          icon="fas fa-exclamation-triangle"
          color="yellow"
        />
        <MetricCard
          title="Today's Sales"
          value={`$${metrics?.todaysSales?.toFixed(2)}`}
          icon="fas fa-cash-register"
          color="green"
        />
      </div>

      {/* Sales Chart */}
      {metrics?.salesData && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
          <Bar
            data={{
              labels: metrics.salesData.map(d => d.date),
              datasets: [{
                label: 'Daily Sales',
                data: metrics.salesData.map(d => d.amount),
                backgroundColor: 'rgba(59, 130, 246, 0.5)'
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
            className="h-64"
          />
        </div>
      )}

      {/* Recent Transactions */}
      {metrics?.recentTransactions && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.recentTransactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colors = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
        <div className={`rounded-full p-3 bg-${color}-100`}>
          <i className={`${icon} ${colors[color]} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

