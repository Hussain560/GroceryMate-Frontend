import api from '../api/api';

const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { username: email, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
      }
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;
