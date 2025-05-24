import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, BarChart2, Heart } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Resultados', path: '/results', icon: <List size={20} /> },
    { name: 'Estatísticas', path: '/statistics', icon: <BarChart2 size={20} /> },
    { name: 'Favoritos', path: '/favorites', icon: <Heart size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-2 ${
              location.pathname === item.path 
                ? 'text-primary-600' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;