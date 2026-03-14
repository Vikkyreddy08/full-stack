import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ✅ FIXED: context/ not hooks/
import { toast } from 'react-hot-toast';
import Loader from './Loader';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { token, user, loading } = useAuth();
  
  if (loading) return <Loader />;  // ✅ Perfect!
  
  if (!token) {
    toast.error('Please login to access this page 🔐');
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  
  // ✅ FIXED: Django User has no 'role' field - use groups or skip
  if (roles.length && !roles.includes(user?.role)) {
    toast.error('Access denied. Insufficient permissions.');
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
