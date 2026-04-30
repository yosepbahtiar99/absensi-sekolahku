import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface IProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'guru';
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children, role }) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
