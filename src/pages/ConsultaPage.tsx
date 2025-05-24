import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, ArrowRight } from 'lucide-react';
import { getLotteryGames } from '../services/api';
import { LotteryGame } from '../types';

const ConsultaPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [contestNumber, setContestNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'latest' | 'specific'>('latest');

  // Carregar a lista de jogos
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
        if (gamesData.length > 0) {
          setSelectedGame(gamesData[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar jogos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // Submeter consulta
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame) {
      return;
    }

    // Navegar para a página de resultados
    if (searchType === 'latest') {
      navigate(`/resultado/${selectedGame}/ultimo`);
    } else {
      navigate(`/resultado/${selectedGame}/${contestNumber}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consulta de Resultados</h1>
        <p className="text-gray-600">Encontre resultados de todos os jogos de loterias</p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {/* Seleção de tipo de consulta */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Tipo de consulta:</p>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setSearchType('latest')}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    searchType === 'latest'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {searchType === 'latest' && <Check size={16} className="mr-2" />}
                    Último concurso
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSearchType('specific')}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    searchType === 'specific'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {searchType === 'specific' && <Check size={16} className="mr-2" />}
                    Concurso específico
                  </span>
                </button>
              </div>
            </div>

            {/* Seleção de jogo */}
            <div className="mb-6">
              <label htmlFor="gameSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Selecione a loteria:
              </label>
              <select
                id="gameSelect"
                className="input"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                required
              >
                {games.length === 0 ? (
                  <option value="">Carregando jogos...</option>
                ) : (
                  games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.nome}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Número do concurso (apenas se for específico) */}
            {searchType === 'specific' && (
              <div className="mb-6">
                <label htmlFor="contestNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número do concurso:
                </label>
                <input
                  id="contestNumber"
                  type="text"
                  className="input"
                  placeholder="Ex: 2500"
                  value={contestNumber}
                  onChange={(e) => setContestNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o número exato do concurso que deseja consultar
                </p>
              </div>
            )}

            {/* Botão de pesquisa */}
            <div className="mt-8">
              <button
                type="submit"
                className="button-primary w-full py-4 flex items-center justify-center"
                disabled={searchType === 'specific' && !contestNumber}
              >
                <Search size={20} className="mr-2" />
                <span>Consultar Resultado</span>
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </form>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Como consultar?</h3>
            <p className="text-blue-700 mb-4">
              Selecione a loteria desejada e escolha entre consultar o último resultado ou um concurso específico. 
              Você pode verificar:
            </p>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <Check size={16} className="mr-2 mt-1 text-blue-500" />
                <span>Números sorteados</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="mr-2 mt-1 text-blue-500" />
                <span>Premiação por faixa</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="mr-2 mt-1 text-blue-500" />
                <span>Valor acumulado</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="mr-2 mt-1 text-blue-500" />
                <span>Data do próximo sorteio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaPage; 