import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Load user from localStorage safely
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('techfix_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse techfix_user from localStorage', e);
      return null;
    }
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('techfix_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techfix_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
