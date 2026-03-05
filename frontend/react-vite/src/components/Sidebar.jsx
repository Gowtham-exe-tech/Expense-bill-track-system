import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/layout.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 30, height: 30, background: 'var(--primary)', borderRadius: '8px' }}></div>
        ExpenseAI
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/upload" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span>Upload Bill</span>
        </NavLink>
        <NavLink to="/bills" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span>Bill List</span>
        </NavLink>
        <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span>Analytics</span>
        </NavLink>
      </nav>
      
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged in as <b>Admin</b></p>
      </div>
    </aside>
  );
};

export default Sidebar;
