import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { GameDetails } from '../types';
import NumberBall from './NumberBall';

interface LatestResultsBannerProps {
  results: Map<string, GameDetails>;
}

const LatestResultsBanner: React.FC<LatestResultsBannerProps> = ({ results }) => {
  // Game colors and names
  const gameInfo: Record<string, { color: string, name: string }> = {
    'mega-sena': { color: 'bg-green-600', name: 'Mega-Sena' },
    'quina': { color: 'bg-purple-600', name: 'Quina' },
    'lotofacil': { color: 'bg-pink-600', name: 'Lotofácil' },
    'lotomania': { color: 'bg-orange-500', name: 'Lotomania' },
    'timemania': { color: 'bg-green-500', name: 'Timemania' },
    'dupla-sena': { color: 'bg-red-600', name: 'Dupla Sena' },
    'federal': { color: 'bg-blue-600', name: 'Federal' },
    'loteca': { color: 'bg-yellow-600', name: 'Loteca' },
    'dia-de-sorte': { color: 'bg-green-700', name: 'Dia de Sorte' },
    'super-sete': { color: 'bg-amber-600', name: 'Super Sete' },
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-4 px-6">
          <h2 className="text-white text-xl font-bold">Últimos Resultados</h2>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {Array.from(results.entries()).map(([gameId, result]) => (
            <motion.div key={gameId} className="p-4" variants={item}>
              <div className="flex items-center mb-3">
                <span className={`${gameInfo[gameId]?.color || 'bg-primary-600'} w-3 h-3 rounded-full mr-2`}></span>
                <h3 className="font-bold">{gameInfo[gameId]?.name || gameId}</h3>
                <span className="ml-auto text-xs bg-gray-100 rounded-full px-2 py-1">
                  {result.concurso}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {(result.numeros || result.dezenas || []).slice(0, 6).map((number, index) => (
                  <NumberBall 
                    key={index} 
                    number={number}
                    gameColor={gameInfo[gameId]?.color || 'bg-primary-600'}
                    small
                  />
                ))}
                {(result.numeros || result.dezenas || []).length > 6 && (
                  <div className="flex items-center justify-center">
                    <span className="text-gray-500 text-sm">+{(result.numeros || result.dezenas || []).length - 6}</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                {result.data}
              </div>
              
              <Link 
                to={`/results/${gameId}`}
                className="flex items-center text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                Ver mais <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LatestResultsBanner;