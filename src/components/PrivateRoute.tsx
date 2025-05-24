import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Redirecionar para a página de login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza os componentes filhos
  return <Outlet />;
};

export default PrivateRoute; 