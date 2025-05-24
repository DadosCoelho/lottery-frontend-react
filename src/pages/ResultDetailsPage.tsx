import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, Users, Award, AlertTriangle, Clock } from 'lucide-react';
import { getLotteryResult, getLotteryGames } from '../services/api';
import { LotteryResult, LotteryGame } from '../types';

const ResultDetailsPage: React.FC = () => {
  const { gameId, contestNumber } = useParams<{ gameId: string; contestNumber: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [gameInfo, setGameInfo] = useState<LotteryGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      if (!gameId || !contestNumber) {
        setError('Parâmetros inválidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Carregar informações do jogo
        const games = await getLotteryGames();
        const game = games.find(g => g.id === gameId);
        if (game) {
          setGameInfo(game);
        }
        
        // Carregar resultado
        const resultData = await getLotteryResult(gameId, contestNumber);
        if (resultData) {
          setResult(resultData);
        } else {
          setError('Resultado não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar resultado:', error);
        setError('Erro ao carregar resultado. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [gameId, contestNumber]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para renderizar as dezenas sorteadas
  const renderNumbers = (numbers: string[]) => {
    const gameColor = gameInfo?.cor || '#1a1a1a';
    
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {numbers.map((number, index) => (
          <div
            key={index}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: gameColor }}
          >
            {number}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        <span>Voltar</span>
      </button>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">Erro</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 button-primary"
          >
            Voltar para Dashboard
          </button>
        </div>
      ) : result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {gameInfo?.nome || gameId} - Concurso {result.concurso}
            </h1>
            <p className="text-gray-600 flex items-center justify-center">
              <Calendar size={16} className="mr-1" />
              <span>Sorteio realizado em {formatDate(result.data)}</span>
            </p>
          </div>

          <div className="card p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Números Sorteados</h2>
            {renderNumbers(result.numeros)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award size={20} className="mr-2" />
                Premiações
              </h2>
              
              <div className="space-y-4">
                {result.premiacoes.map((premio, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                    <p className="font-medium">{premio.acertos}</p>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 flex items-center">
                        <Users size={14} className="mr-1" />
                        {premio.ganhadores} {premio.ganhadores === 1 ? 'ganhador' : 'ganhadores'}
                      </span>
                      <span className="text-green-600 font-medium flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        {premio.premio}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock size={20} className="mr-2" />
                Próximo Concurso
              </h2>

              {result.acumulado && (
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <p className="text-blue-800 font-medium flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    Prêmio Acumulado!
                  </p>
                  <p className="text-blue-700 mt-1">
                    Valor estimado: <span className="font-bold">{result.valorAcumulado}</span>
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar size={18} className="text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Data do próximo sorteio</p>
                    <p className="font-medium">
                      {result.dataProxConcurso ? formatDate(result.dataProxConcurso) : 'A definir'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Award size={18} className="text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Concurso</p>
                    <p className="font-medium">{result.proxConcurso || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
};

export default ResultDetailsPage; 