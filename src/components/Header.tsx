import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clover, LogOut, User, Menu, X, Ticket, Home, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao mudar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-3'
  }`;

  const activeClass = "text-primary-600 font-medium";
  const inactiveClass = "text-gray-700 hover:text-primary-600";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Clover className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Consulta de Loterias</span>
          </Link>

          {/* Menu para telas médias e grandes */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6 ml-10">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 ${location.pathname === '/' ? activeClass : inactiveClass}`}
              >
                <Home size={18} />
                <span>Início</span>
              </Link>
              <Link 
                to="/consulta" 
                className={`flex items-center space-x-1 ${location.pathname === '/consulta' ? activeClass : inactiveClass}`}
              >
                <Search size={18} />
                <span>Consultar Resultados</span>
              </Link>
              <Link 
                to="/minhas-apostas" 
                className={`flex items-center space-x-1 ${location.pathname === '/minhas-apostas' ? activeClass : inactiveClass}`}
              >
                <Ticket size={18} />
                <span>Minhas Apostas</span>
              </Link>
            </nav>
          )}

          {/* Área do usuário */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm py-1 px-3 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Sair</span>
              </button>
              {/* Menu burger para mobile */}
              <button 
                className="md:hidden flex items-center" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Menu mobile */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className={`flex items-center space-x-2 p-2 rounded-md ${location.pathname === '/' ? 'bg-primary-50 ' + activeClass : inactiveClass}`}>
                <Home size={18} />
                <span>Início</span>
              </Link>
              <Link to="/consulta" className={`flex items-center space-x-2 p-2 rounded-md ${location.pathname === '/consulta' ? 'bg-primary-50 ' + activeClass : inactiveClass}`}>
                <Search size={18} />
                <span>Consultar Resultados</span>
              </Link>
              <Link to="/minhas-apostas" className={`flex items-center space-x-2 p-2 rounded-md ${location.pathname === '/minhas-apostas' ? 'bg-primary-50 ' + activeClass : inactiveClass}`}>
                <Ticket size={18} />
                <span>Minhas Apostas</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;