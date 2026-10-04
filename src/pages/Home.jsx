import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import CustomerPortal from './CustomerPortal';

const Home = () => {
  const { user } = useAuth();
  
  if (user && user.role === 'customer') {
    return <CustomerPortal />;
  }
  
  return <Dashboard />;
};

export default Home;
