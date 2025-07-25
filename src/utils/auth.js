export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.roles?.[0] || null;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
