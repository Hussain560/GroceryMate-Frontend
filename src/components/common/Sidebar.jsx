import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AiOutlineDashboard,
  AiOutlineShop,
  AiOutlineBarChart,
  AiOutlineSetting,
} from 'react-icons/ai';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors
       ${isActive ? 'bg-gray-200 text-gray-800' : ''}`
    }
  >
    {icon && <span className="mr-3 text-gray-400">{icon}</span>}
    <span>{label}</span>
  </NavLink>
);

const Sidebar = ({ role = 'Manager' }) => {
  const [openSections, setOpenSections] = useState({
    inventory: false,
    reports: false,
    manage: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Determine dashboard route based on role
  const dashboardRoute = role === 'Employee' ? '/dashboard/employee' : '/dashboard/manager';

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white text-gray-800 p-4 shadow-md">
      <h1 className="text-2xl font-bold mb-8">GroceryMate</h1>
      <nav className="space-y-6">
        {/* Dashboard (no nested items, just one link) */}
        <div>
          <NavItem
            to={dashboardRoute}
            icon={<AiOutlineDashboard size={20} />}
            label="Dashboard"
          />
          <div className="border-b border-gray-200 mt-4"></div>
        </div>
        {/* Inventory */}
        <div>
          <button
            className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100"
            onClick={() => toggleSection('inventory')}
          >
            <AiOutlineShop size={20} className="text-gray-400 mr-3" />
            <span className="flex-1">Inventory</span>
          </button>
          {openSections.inventory && (
            <ul className="ml-6 mt-2 space-y-1">
              <li>
                <NavItem to="/inventory/products" label="Products" />
              </li>
              <li>
                <NavItem to="/inventory/count" label="Inventory Count" />
              </li>
              <li>
                <NavItem to="/inventory/history" label="Stock History" />
              </li>
              <li>
                <NavItem to="/inventory/suppliers" label="Suppliers" />
              </li>
              <li>
                <NavItem to="/inventory/purchasing" label="Purchasing" />
              </li>
            </ul>
          )}
          <div className="border-b border-gray-200 mt-4"></div>
        </div>
        {/* Reports */}
        <div>
          <button
            className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100"
            onClick={() => toggleSection('reports')}
          >
            <AiOutlineBarChart size={20} className="text-gray-400 mr-3" />
            <span className="flex-1">Reports</span>
          </button>
          {openSections.reports && (
            <ul className="ml-6 mt-2 space-y-1">
              <li>
                <NavItem to="/reports/sales" label="Sales Report" />
              </li>
              <li>
                <NavItem to="/reports/inventory" label="Inventory Report" />
              </li>
              <li>
                <NavItem to="/reports/payments" label="Payments Report" />
              </li>
              <li>
                <NavItem to="/reports/supplier" label="Supplier Report" />
              </li>
            </ul>
          )}
          <div className="border-b border-gray-200 mt-4"></div>
        </div>
        {/* Manage */}
        {role === 'Manager' && (
          <div>
            <button
              className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100"
              onClick={() => toggleSection('manage')}
            >
              <AiOutlineSetting size={20} className="text-gray-400 mr-3" />
              <span className="flex-1">Manage</span>
            </button>
            {openSections.manage && (
              <ul className="ml-6 mt-2 space-y-1">
                <li>
                  <NavItem to="/manage/users" label="Users" />
                </li>
                <li>
                  <NavItem to="/manage/roles" label="Roles" />
                </li>
                <li>
                  <NavItem to="/manage/discounts" label="Discounts" />
                </li>
                <li>
                  <NavItem to="/manage/promotions" label="Promotions" />
                </li>
                <li>
                  <NavItem to="/manage/branches" label="Branches" />
                </li>
                <li>
                  <NavItem to="/manage/devices" label="Devices" />
                </li>
                <li>
                  <NavItem to="/manage/login" label="Login" />
                </li>
              </ul>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
