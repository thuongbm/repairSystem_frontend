import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Reception from './pages/Reception';
import Pricing from './pages/Pricing';
import HR from './pages/HR';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="reception" element={<Reception />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="hr" element={<HR />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;