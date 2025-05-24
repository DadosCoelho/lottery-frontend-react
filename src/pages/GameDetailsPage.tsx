import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, TrendingUp, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { getContestDetails } from '../services/api';
import { GameDetails } from '../types';
import NumberBall from '../components/NumberBall';
import LoadingSpinner from '../components/LoadingSpinner';

const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const contestNumber = searchParams.get('concurso');
  
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameId || !contestNumber) return;
      
      setLoading(true);
      try {
        const details = await getContestDetails(gameId, parseInt(contestNumber));
        setGameDetails(details);
      } catch (error) {
        console.error('Error fetching game details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId, contestNumber]);

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
  
  const colorClass = gameId ? gameColors[gameId] || 'bg-primary-600' : 'bg-primary-600';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!gameDetails) {
    return (
      <div className="mt-16">
        <Link to={`/results/${gameId}`} className="flex items-center text-primary-600 mb-8">
          <ArrowLeft size={18} className="mr-1" /> Voltar para resultados
        </Link>
        
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Resultado não encontrado</h2>
          <p className="text-gray-500 mb-6">Não foi possível encontrar os detalhes deste concurso.</p>
          <Link to={`/results/${gameId}`} className="button-primary">
            Ver outros resultados
          </Link>
        </div>
      </div>
    );
  }

  const prevContestNumber = gameDetails.concurso > 1 ? gameDetails.concurso - 1 : null;
  const nextContestNumber = gameDetails.proxConcurso || null;

  return (
    <div className="mt-16">
      <Link to={`/results/${gameId}`} className="flex items-center text-primary-600 mb-8">
        <ArrowLeft size={18} className="mr-1" /> Voltar para resultados
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Game Header */}
        <div className={`${colorClass} rounded-t-lg p-6 text-white`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">{gameDetails.nome || gameId}</h1>
            <span className="text-xl font-bold bg-white/20 px-3 py-1 rounded-full">
              {gameDetails.concurso}
            </span>
          </div>
          <div className="flex items-center mt-2 text-white/80">
            <Calendar size={16} className="mr-1" />
            <span>{gameDetails.data}</span>
          </div>
        </div>
        
        {/* Numbers */}
        <div className="bg-white p-6 rounded-b-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Números Sorteados</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {(gameDetails.numeros || gameDetails.dezenas || []).map((number, index) => (
              <NumberBall 
                key={index} 
                number={number}
                gameColor={colorClass}
                className="w-12 h-12 text-xl"
              />
            ))}
          </div>
          
          {/* Prize Information */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award size={20} className="mr-2" /> Premiação
            </h2>
            
            {gameDetails.premiacoes && gameDetails.premiacoes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Acertos
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Ganhadores
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Prêmio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gameDetails.premiacoes.map((premio, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {premio.acertos}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {premio.vencedores === 0 ? (
                            <span className="text-orange-600 font-medium">Acumulou</span>
                          ) : (
                            <span>{premio.vencedores} {premio.vencedores === 1 ? 'ganhador' : 'ganhadores'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {premio.premio ? formatCurrency(premio.premio) : 'R$ 0,00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Informações de premiação não disponíveis.</p>
            )}
          </div>
          
          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Contest Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Informações do Concurso</h3>
              <ul className="space-y-2 text-sm">
                {gameDetails.arrecadacaoTotal && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Arrecadação Total:</span>
                    <span className="font-medium">{formatCurrency(gameDetails.arrecadacaoTotal)}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-600">Acumulado:</span>
                  <span className="font-medium">{gameDetails.acumulado ? 'Sim' : 'Não'}</span>
                </li>
              </ul>
            </div>
            
            {/* Next Contest */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Próximo Concurso</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium">{gameDetails.proxConcurso}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{gameDetails.dataProxConcurso}</span>
                </li>
                {gameDetails.acumuladaProxConcurso && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Prêmio Estimado:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(gameDetails.acumuladaProxConcurso)}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Contest Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {prevContestNumber ? (
              <Link
                to={`/game/${gameId}?concurso=${prevContestNumber}`}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <ChevronLeft size={18} className="mr-1" /> Concurso Anterior
              </Link>
            ) : (
              <div></div>
            )}
            
            {nextContestNumber ? (
              <Link
                to={`/game/${gameId}?concurso=${nextContestNumber}`}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                Próximo Concurso <ChevronRight size={18} className="ml-1" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link to={`/statistics/${gameId}`} className="button-outline flex-1 justify-center">
            <TrendingUp size={18} className="mr-2" /> Ver Estatísticas
          </Link>
          <Link to={`/results/${gameId}`} className="button-outline flex-1 justify-center">
            <Search size={18} className="mr-2" /> Buscar Outros Concursos
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default GameDetailsPage;