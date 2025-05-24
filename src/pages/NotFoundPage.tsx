import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div className="mt-16 flex flex-col items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold mt-6 mb-4">Página Não Encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="button-primary">
            <Home size={18} className="mr-2" /> Voltar ao Início
          </Link>
          <Link to="/results" className="button-outline">
            <Search size={18} className="mr-2" /> Ver Resultados
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;