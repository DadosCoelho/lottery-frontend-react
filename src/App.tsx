import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Contexto de autenticação
import AuthProvider from './contexts/AuthContext';

// Componentes
import PrivateRoute from './components/PrivateRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import ResultDetailsPage from './pages/ResultDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConsultaPage from './pages/ConsultaPage';
import MinhasApostasPage from './pages/MinhasApostasPage';

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rotas Protegidas */}
            <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
                
                {/* Rotas da dashboard */}
                <Route path="resultados" element={<DashboardPage />} />
                <Route path="estatisticas" element={<DashboardPage />} />
                <Route path="consulta" element={<ConsultaPage />} />
                <Route path="minhas-apostas" element={<MinhasApostasPage />} />
                
                {/* Rota de resultados */}
            <Route path="resultado/:gameId/:contestNumber" element={<ResultDetailsPage />} />
                
            <Route path="*" element={<NotFoundPage />} />
              </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;