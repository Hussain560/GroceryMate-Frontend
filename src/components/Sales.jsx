import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { getUserRole } from '../utils/auth';
import Price from './Price';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
  });
  const isManager = getUserRole() === 'Manager';
  const itemsPerPage = 10;

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit: itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await api.get(`/sales?${queryParams}`);
      // Update to handle the direct array response
      const salesData = Array.isArray(response.data) ? response.data : [];
      setSales(salesData);
      setTotalPages(Math.ceil(salesData.length / itemsPerPage));
    } catch (error) {
      setError('Failed to fetch sales');
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, filters]);

  const handleSearch = (e) => {
    setPage(1);
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleDateChange = (field, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales History</h1>
        <Link
          to="/sales/create"
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          New Sale
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search sales..."
          value={filters.search}
          onChange={handleSearch}
          className="w-full md:w-1/3 p-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleDateChange('dateFrom', e.target.value)}
          className="w-full md:w-1/4 p-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleDateChange('dateTo', e.target.value)}
          className="w-full md:w-1/4 p-2 border rounded-lg"
        />
        <button
          onClick={() => fetchSales()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Sale ID</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Payment</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Items</th>
                {isManager && (
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={isManager ? 6 : 5} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{sale.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      {new Date(sale.saleDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Price amount={sale.finalTotal} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sale.paymentMethod === 'Cash' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sale.itemCount} items
                    </td>
                    {isManager && (
                      <td className="px-6 py-4">
                        <Link
                          to={`/sales/${sale.id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <i className="fas fa-eye"></i>
                          <span className="ml-2">View</span>
                        </Link>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-4 py-2 rounded ${
              page >= totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
