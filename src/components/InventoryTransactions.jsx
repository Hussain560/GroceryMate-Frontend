import { useState, useEffect } from 'react';
import api from '../api/api';

export default function InventoryTransactions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Construct query params based on filters
      const params = new URLSearchParams();
      if (filters.type) params.append('transactionType', filters.type); // Updated to match API
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/inventory/transactions?${params}`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.type]); // Refresh when type filter changes

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <button
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="Restock">Restock</option>
            <option value="Spoilage">Spoilage</option>
            <option value="Sale">Sale</option>
          </select>

          <form onSubmit={handleDateSearch} className="flex gap-2">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.transactionDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{transaction.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.transactionType === 'Restock' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.transactionType === 'Spoilage'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">{transaction.quantity}</td>
                  <td className="px-6 py-4">{transaction.userName}</td>
                  <td className="px-6 py-4">{transaction.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
