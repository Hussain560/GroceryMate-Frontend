import React from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarNav } from '../navConfig';

const NavBar = () => (
  <nav className="bg-gray-800 p-4">
    {sidebarNav.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `text-white mx-2 p-2 ${isActive ? 'bg-gray-700' : ''}`}
      >
        {item.icon} {item.label}
      </NavLink>
    ))}
  </nav>
);

export default NavBar;