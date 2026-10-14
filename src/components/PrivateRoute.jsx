import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Check if JWT token is expired
 * @param {string|null} token 
 * @returns {boolean}
 */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    // Check exp in seconds converted to milliseconds
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default PrivateRoute;
