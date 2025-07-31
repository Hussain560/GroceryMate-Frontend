import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { isAuthenticated } from './utils/auth';
import Modal from 'react-modal';
import { ROUTES } from './routes';

// Lazy load all pages
const Login = lazy(() => import('./components/Manage/Login'));
const DashboardManager = lazy(() => import('./components/Dashboard/ManagerDashboard'));
const DashboardEmployee = lazy(() => import('./components/Dashboard/EmployeeDashboard'));
const InventoryList = lazy(() => import('./components/Inventory/InventoryList'));
const InventoryAdd = lazy(() => import('./components/Inventory/InventoryAdd'));
const InventoryEdit = lazy(() => import('./components/Inventory/InventoryEdit'));
const Restock = lazy(() => import('./components/Inventory/Restock'));
const Spoilage = lazy(() => import('./components/Inventory/Spoilage'));
const InventoryCount = lazy(() => import('./components/Inventory/InventoryCount'));
const StockHistory = lazy(() => import('./components/Inventory/StockHistory'));
const Suppliers = lazy(() => import('./components/Inventory/Suppliers'));
const SalesReport = lazy(() => import('./components/Reports/SalesReport'));
const InventoryReport = lazy(() => import('./components/Reports/InventoryReport'));
const PaymentsReport = lazy(() => import('./components/Reports/PaymentsReport'));
const SupplierReport = lazy(() => import('./components/Reports/SupplierReport'));
const PurchaseOrders = lazy(() => import('./components/Purchasing/PurchaseOrders'));
const Receiving = lazy(() => import('./components/Purchasing/Receiving'));
const Users = lazy(() => import('./components/Manage/Users'));
const Roles = lazy(() => import('./components/Manage/Roles'));
const Discounts = lazy(() => import('./components/Manage/Discounts'));
const Promotions = lazy(() => import('./components/Manage/Promotions'));
const Branches = lazy(() => import('./components/Manage/Branches'));
const Devices = lazy(() => import('./components/Manage/Devices'));

// Importing styles
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
    <Router>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.dashboardManager}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <DashboardManager />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.dashboardEmployee}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <DashboardEmployee />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventory}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <InventoryList />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventoryAdd}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <InventoryAdd />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventoryEdit}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <InventoryEdit />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventoryRestock}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Restock />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventorySpoilage}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Spoilage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventoryCount}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <InventoryCount />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventoryHistory}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <StockHistory />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.inventorySuppliers}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Suppliers />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.reportsSales}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <SalesReport />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.reportsInventory}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <InventoryReport />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.reportsPayments}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <PaymentsReport />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.reportsSuppliers}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <SupplierReport />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.purchaseOrders}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <PurchaseOrders />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.receiving}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Receiving />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.manageUsers}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Users />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.manageRoles}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Roles />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.manageDiscounts}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Discounts />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.managePromotions}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Promotions />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.manageBranches}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Branches />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.manageDevices}
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>}>
              <Devices />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.login} />} />
      </Routes>
    </Router>
  );
}

export default App;

