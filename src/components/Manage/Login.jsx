// src/components/Manage/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { ROUTES } from '../../routes';
import { getUserRole } from '../../utils/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      const role = getUserRole();

      if (role === 'Manager') {
        navigate(ROUTES.dashboardManager);
      } else if (role === 'Employee') {
        navigate(ROUTES.dashboardEmployee);
      } else {
        setError('Unauthorized role.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login to GroceryMate</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 mb-4 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="block mb-2 text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 mb-4 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
