import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LotteryGame, GameDetails } from '../types';
import NumberBall from './NumberBall';

interface GameCardProps {
  game: LotteryGame;
  latestResult?: GameDetails;
}

const GameCard: React.FC<GameCardProps> = ({ game, latestResult }) => {
  // Define game colors based on the Brazilian lottery colors or default to primary if not specified
  const gameColors: Record<string, { bg: string, text: string, ball: string }> = {
    'mega-sena': { bg: 'bg-green-600', text: 'text-green-600', ball: 'bg-green-600' },
    'quina': { bg: 'bg-purple-600', text: 'text-purple-600', ball: 'bg-purple-600' },
    'lotofacil': { bg: 'bg-pink-600', text: 'text-pink-600', ball: 'bg-pink-600' },
    'lotomania': { bg: 'bg-orange-500', text: 'text-orange-500', ball: 'bg-orange-500' },
    'timemania': { bg: 'bg-green-500', text: 'text-green-500', ball: 'bg-green-500' },
    'dupla-sena': { bg: 'bg-red-600', text: 'text-red-600', ball: 'bg-red-600' },
    'federal': { bg: 'bg-blue-600', text: 'text-blue-600', ball: 'bg-blue-600' },
    'loteca': { bg: 'bg-yellow-600', text: 'text-yellow-600', ball: 'bg-yellow-600' },
    'dia-de-sorte': { bg: 'bg-green-700', text: 'text-green-700', ball: 'bg-green-700' },
    'super-sete': { bg: 'bg-amber-600', text: 'text-amber-600', ball: 'bg-amber-600' },
  };
  
  const colorSet = gameColors[game.id] || { bg: 'bg-primary-600', text: 'text-primary-600', ball: 'bg-primary-600' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden"
    >
      {/* Game header with color band */}
      <div className={`${colorSet.bg} h-3 w-full`}></div>
      
      <div className="p-5">
        <h3 className={`${colorSet.text} font-bold text-xl mb-2`}>
          {game.nome}
        </h3>
        
        {latestResult ? (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-gray-600 text-sm">Concurso</span>
              <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium">
                {latestResult.concurso}
              </span>
              <span className="text-gray-600 text-sm">{latestResult.data}</span>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {(latestResult.numeros || latestResult.dezenas || []).slice(0, 6).map((number, index) => (
                  <NumberBall 
                    key={index} 
                    number={number}
                    gameColor={colorSet.ball}
                    small
                  />
                ))}
                {(latestResult.numeros || latestResult.dezenas || []).length > 6 && (
                  <div className="flex items-center justify-center">
                    <span className="text-gray-500 text-sm">+{(latestResult.numeros || latestResult.dezenas || []).length - 6}</span>
                  </div>
                )}
              </div>
              
              {latestResult.acumulado && (
                <div className="text-sm font-medium text-green-600">
                  Acumulado para próximo sorteio
                </div>
              )}

              {latestResult.acumuladaProxConcurso && (
                <div className="mt-2">
                  <span className="text-gray-600 text-sm">Próximo prêmio:</span>
                  <span className="font-bold text-gray-900 ml-1">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(latestResult.acumuladaProxConcurso)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Informações não disponíveis</p>
          </div>
        )}
        
        <div className="flex space-x-2 mt-4">
          <Link 
            to={`/results/${game.id}`}
            className="button-outline text-sm flex-1 flex justify-center"
          >
            Ver Resultados
          </Link>
          <Link 
            to={`/statistics/${game.id}`}
            className={`text-sm flex-1 button bg-white border border-gray-200 ${colorSet.text} hover:bg-gray-50`}
          >
            Estatísticas
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;