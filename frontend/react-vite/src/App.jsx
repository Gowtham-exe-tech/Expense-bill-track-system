import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadBill from './pages/UploadBill';
import BillList from './pages/BillList';
import BillDetail from './pages/BillDetail';
import Analytics from './pages/Analytics';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <header className="top-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>AI Expense Bill Approval System</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="badge badge-approved">System Active</span>
            </div>
          </header>
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Navigate to="/analytics" />} />
              <Route path="/upload" element={<UploadBill />} />
              <Route path="/bills" element={<BillList />} />
              <Route path="/bills/:id" element={<BillDetail />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
