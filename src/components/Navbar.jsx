import { Link, useLocation } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();
  const userRole = getUserRole();
  const isManager = userRole === 'Manager';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', showFor: ['Manager', 'Employee'] },
    { 
      to: '/inventory', 
      label: 'Inventory', 
      icon: 'fas fa-boxes', 
      showFor: ['Manager', 'Employee'], 
      isDropdown: true,
      dropdownItems: [
        { to: '/inventory', label: 'Products', icon: 'fas fa-box-open' },
        { to: '/inventory/lowstock', label: 'Low Stock', icon: 'fas fa-exclamation-triangle' },
        { to: '/inventory/transactions', label: 'Transactions', icon: 'fas fa-history' }
      ]
    },
    { 
      to: '/sales', 
      label: 'Sales', 
      icon: 'fas fa-shopping-cart', 
      showFor: ['Manager', 'Employee'], 
      isDropdown: true, 
      dropdownItems: [
        { to: '/sales/create', label: 'New Sale', icon: 'fas fa-plus' },
        { to: '/sales', label: 'Sales History', icon: 'fas fa-history' }
      ]
    },
    { to: '/users', label: 'Users', icon: 'fas fa-users', showFor: ['Manager'] }
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">GroceryMate</span>
            <div className="hidden md:flex ml-10 space-x-4">
              {navLinks.map(link => (
                (link.showFor.includes(userRole) || isManager) && (
                  link.isDropdown ? (
                    <div key={link.to} className="relative group">
                      <button className={`px-3 py-2 rounded-md text-sm font-medium flex items-center
                        ${location.pathname.startsWith(link.to) 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                      >
                        <i className={`${link.icon} mr-2`}></i>
                        {link.label}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          {link.dropdownItems.map(item => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                            >
                              <i className={`${item.icon} mr-2`}></i>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium 
                        ${location.pathname === link.to 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    >
                      <i className={`${link.icon} mr-2`}></i>
                      {link.label}
                    </Link>
                  )
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
