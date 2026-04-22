import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Predict from './pages/Predict';
import Health from './pages/Health';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/predict"   element={<Predict />}   />
            <Route path="/health"    element={<Health />}    />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
