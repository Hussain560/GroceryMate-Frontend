import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { getUserRole } from '../utils/auth';
import Modal from 'react-modal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [feedback, setFeedback] = useState(null);
  
  const navigate = useNavigate();
  const isManager = getUserRole() === 'Manager';

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role })
      });

      // Fetch users and roles
      const [usersRes, rolesRes] = await Promise.all([
        api.get(`/user?${params}`),
        api.get('/user/roles')
      ]);

      // If API returns { data: [...], total: N }
      const usersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data.data || []);
      const total = usersRes.data.total || usersData.length;

      setUsers(usersData);
      setRoles(rolesRes.data);
      setTotalPages(Math.max(1, Math.ceil(total / filters.limit)));
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
      setRoles([]);
      setTotalPages(1);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [filters.page, filters.role, filters.search]);

  const handleDelete = async () => {
    try {
      await api.delete(`/user/${deleteModal.user.id}`);
      showFeedback('success', 'User deleted successfully');
      setUsers(users.filter(u => u.id !== deleteModal.user.id));
      setDeleteModal({ isOpen: false, user: null });
    } catch (err) {
      showFeedback('error', 'Failed to delete user');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {feedback && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 
          ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
          text-white animate-slide-up`}
        >
          <div className="flex items-center">
            <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            {isManager && (
              <button
                onClick={() => navigate('/users/add')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <i className="fas fa-plus mr-2"></i>
                Add User
              </button>
            )}
          </div>

          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-1/3 p-2 border rounded-lg"
            />
            
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="w-1/4 p-2 border rounded-lg"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  {isManager && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.fullName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, user })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page === 1}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= totalPages}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onRequestClose={() => setDeleteModal({ isOpen: false, user: null })}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4">Delete User</h2>
        <p>Are you sure you want to delete user "{deleteModal.user?.email}"?</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setDeleteModal({ isOpen: false, user: null })}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
