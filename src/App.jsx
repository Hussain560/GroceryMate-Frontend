import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import { isAuthenticated } from './utils/auth';
import Inventory from './components/Inventory';
import ProtectedRoute from './components/ProtectedRoute';
import InventoryEdit from './components/InventoryEdit';
import InventoryAdd from './components/InventoryAdd';
import InventoryLowstock from './components/InventoryLowstock';
import InventoryTransactions from './components/InventoryTransactions';
import SalesCreate from './components/SalesCreate';
import Modal from 'react-modal';
import { CartProvider } from './context/CartContext';
import Sales from './components/Sales';
import SaleDetails from './components/SaleDetails';
import Users from './components/Users';
import UserAdd from './components/UserAdd';
import UserEdit from './components/UserEdit';


// Set Modal app element once at the app root
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsAuth(auth);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen w-full bg-gray-100">
          {isAuth && <Navbar />}
          <main className={`w-full ${isAuth ? 'pt-16' : ''}`}>
            <Routes>
              <Route 
                path="/login" 
                element={isAuth ? <Navigate to="/dashboard" /> : <Login />} 
              />
              <Route 
                path="/dashboard" 
                element={isAuth ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/inventory/*" 
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/edit/:id" 
                element={
                  <ProtectedRoute roles={['Manager']}>
                    <InventoryEdit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/add" 
                element={
                  <ProtectedRoute roles={['Manager']}>
                    <InventoryAdd />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/lowstock" 
                element={
                  <ProtectedRoute>
                    <InventoryLowstock />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/transactions" 
                element={
                  <ProtectedRoute>
                    <InventoryTransactions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales" 
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/create" 
                element={
                  <ProtectedRoute>
                    <SalesCreate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/:id" 
                element={
                  <ProtectedRoute>
                    <SaleDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute roles={['Manager']}>
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users/add" 
                element={
                  <ProtectedRoute roles={['Manager']}>
                    <UserAdd />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users/edit/:id" 
                element={
                  <ProtectedRoute roles={['Manager']}>
                    <UserEdit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;

