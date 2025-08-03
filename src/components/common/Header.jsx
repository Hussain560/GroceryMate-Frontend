import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineUser, AiOutlineCaretDown, AiOutlineCaretUp } from 'react-icons/ai';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const username = localStorage.getItem('username') || 'System Admin';
  const role = localStorage.getItem('role') || 'Manager';

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-10 flex items-center" style={{ height: '4rem' }}>
      {/* GroceryMate at top left and vertical divider */}
      <div className="flex items-center h-full w-64 px-4 border-r border-gray-200">
        <span className="text-2xl font-bold">GroceryMate</span>
      </div>
      {/* Profile icon near the right, but not at the very end */}
      <div className="flex-1 flex items-center h-full justify-end pr-44 relative">
        <div className="relative group" ref={dropdownRef}>
          <button
            className={`focus:outline-none flex items-center border rounded px-3 py-1 transition-colors ${
              showDropdown ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white'
            }`}
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Profile"
            id="profile-icon-btn"
          >
            <AiOutlineUser className="text-gray-400 text-2xl cursor-pointer" />
            {showDropdown ? (
              <AiOutlineCaretUp className="ml-2 text-gray-400" />
            ) : (
              <AiOutlineCaretDown className="ml-2 text-gray-400" />
            )}
          </button>
          <div
            className={`absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg transition-opacity duration-200 ${
              showDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            style={{ left: 0, top: '2.5rem' }}
            tabIndex={-1}
          >
            <div className="text-gray-800 font-semibold px-4 pt-3">{username}</div>
            <div className="text-gray-600 text-sm mt-1 px-4">{role}</div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full mt-3 mb-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

