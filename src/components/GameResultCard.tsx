import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Award, Calendar } from 'lucide-react';
import { LotteryResult } from '../types';
import NumberBall from './NumberBall';

interface GameResultCardProps {
  result: LotteryResult;
  gameId: string;
  formattedDate: string;
}

const GameResultCard: React.FC<GameResultCardProps> = ({
  result,
  gameId,
  formattedDate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define game colors based on the Brazilian lottery colors or default to primary
  const gameColors: Record<string, string> = {
    'mega-sena': 'bg-green-600',
    'quina': 'bg-purple-600',
    'lotofacil': 'bg-pink-600',
    'lotomania': 'bg-orange-500',
    'timemania': 'bg-green-500',
    'dupla-sena': 'bg-red-600',
    'federal': 'bg-blue-600',
    'loteca': 'bg-yellow-600',
    'dia-de-sorte': 'bg-green-700',
    'super-sete': 'bg-amber-600',
  };
  
  const colorClass = gameColors[gameId] || 'bg-primary-600';

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Early return if result is not properly defined
  if (!result || result.concurso == null) {
    return null;
  }

  return (
    <motion.div
      layout
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className={`${colorClass} text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-3`}>
              {result.concurso.toString().slice(-2)}
            </span>
            <div>
              <h3 className="font-bold text-lg">Concurso {result.concurso}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar size={14} className="mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>
          
          {result.premiacoes && result.premiacoes.length > 0 && (
            <div className="mt-2 sm:mt-0">
              <div className="flex items-center text-sm">
                <Award size={16} className="mr-1 text-secondary-500" />
                <span className="font-medium mr-1">Premiação:</span>
                {result.premiacoes[0].vencedores > 0 ? (
                  <span className="text-green-600 font-bold">
                    {result.premiacoes[0].vencedores} ganhador{result.premiacoes[0].vencedores > 1 ? 'es' : ''}
                  </span>
                ) : (
                  <span className="text-orange-600 font-bold">Acumulou</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {result.numeros.map((number, index) => (
            <NumberBall 
              key={index} 
              number={number}
              gameColor={colorClass}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={toggleExpanded}
            className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
            <ChevronDown 
              size={16} 
              className={`ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
          
          <Link
            to={`/game/${gameId}?concurso=${result.concurso}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver completo
          </Link>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              {/* Prize information if available */}
              {result.premiacoes && result.premiacoes.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Premiações</h4>
                  
                  <div className="grid grid-cols-3 text-sm font-medium text-gray-500 pb-1">
                    <div>Acertos</div>
                    <div>Ganhadores</div>
                    <div>Prêmio</div>
                  </div>
                  
                  {result.premiacoes.map((premio, index) => (
                    <div key={index} className="grid grid-cols-3 text-sm">
                      <div className="font-medium">{premio.acertos}</div>
                      <div>{premio.vencedores} {premio.vencedores === 1 ? 'ganhador' : 'ganhadores'}</div>
                      <div className="font-medium">
                        {premio.premio ? (
                          new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(premio.premio)
                        ) : (
                          'R$ 0,00'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Informações detalhadas não disponíveis para este resultado.</p>
              )}
              
              {/* Next contest information */}
              {result.proxConcurso && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium mb-2">Próximo Concurso</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Concurso:</span>
                      <span className="font-medium ml-1">{result.proxConcurso}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Data:</span>
                      <span className="font-medium ml-1">{result.dataProxConcurso}</span>
                    </div>
                    {result.acumuladaProxConcurso && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Prêmio Estimado:</span>
                        <span className="font-bold text-green-600 ml-1">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(result.acumuladaProxConcurso)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GameResultCard;