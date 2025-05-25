import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { getLotteryGames } from '../services/api';
import { LotteryGame } from '../types';

const ConsultaPage: React.FC = () => {
  const navigate = useNavigate();
  const { gameId, concursoId } = useParams();
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [contestNumber, setContestNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGames, setLoadingGames] = useState<boolean>(true);
  const [searchType, setSearchType] = useState<'latest' | 'specific'>('latest');
  const [error, setError] = useState<string>('');

  // Carregar a lista de jogos
  useEffect(() => {
    const loadGames = async () => {
      setLoadingGames(true);
      setError('');
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
      } catch (error) {
        setError('Erro ao carregar lista de jogos. Verifique sua conexão e tente novamente.');
      } finally {
        setLoadingGames(false);
      }
    };

    loadGames();
  }, []);

  // Sincronizar com parâmetros da URL quando chegamos na página
  useEffect(() => {
    if (gameId && games.length > 0) {
      const gameExists = games.find(game => game.id === gameId);
      if (gameExists) {
        setSelectedGame(gameId);
      } else {
        setError(`Jogo "${gameId}" não encontrado.`);
      }

      if (concursoId && concursoId !== 'ultimo') {
        setSearchType('specific');
        setContestNumber(concursoId);
      } else if (concursoId === 'ultimo') {
        setSearchType('latest');
        setContestNumber('');
      }
    }
  }, [gameId, concursoId, games]);

  // Validar número do concurso
  const isValidContestNumber = (num: string): boolean => {
    if (!num || num.trim() === '') return false;
    const parsed = parseInt(num.trim(), 10);
    const isValid = !isNaN(parsed) && parsed > 0 && parsed.toString() === num.trim();
    return isValid;
  };

  // Submeter consulta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedGame) {
        throw new Error('Por favor, selecione uma loteria!');
      }

      if (searchType === 'specific') {
        if (!contestNumber.trim()) {
          throw new Error('Digite o número do concurso!');
        }
        if (!isValidContestNumber(contestNumber.trim())) {
          throw new Error('Digite um número de concurso válido (apenas números positivos)!');
        }
      }

      const gameExists = games.find(game => game.id === selectedGame);
      if (!gameExists) {
        throw new Error('Jogo selecionado não é válido. Recarregue a página e tente novamente.');
      }

      const targetConcurso = searchType === 'latest' ? 'ultimo' : contestNumber.trim();
      const targetUrl = `/resultado/${selectedGame}/${targetConcurso}`;
      navigate(targetUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Limpar erro quando campos são alterados
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [selectedGame, contestNumber, searchType]);

  // Handler para mudança de jogo
  const handleGameChange = (gameId: string) => {
    setSelectedGame(gameId);
  };

  // Handler para mudança do tipo de busca
  const handleSearchTypeChange = (type: 'latest' | 'specific') => {
    setSearchType(type);
    if (type === 'latest') {
      setContestNumber('');
    }
  };

  // Handler para mudança do número do concurso
  const handleContestNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setContestNumber(numericValue);
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
          {/* Loading de jogos */}
          {loadingGames && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <Loader size={20} className="animate-spin text-blue-500 mr-2" />
              <p className="text-blue-700">Carregando lista de jogos...</p>
            </div>
          )}

          {/* Mostrar erro se houver */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Seleção de tipo de consulta */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Tipo de consulta:</p>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange('latest')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                    searchType === 'latest'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  disabled={loading || loadingGames}
                >
                  <span className="flex items-center justify-center">
                    {searchType === 'latest' && <Check size={16} className="mr-2" />}
                    Último concurso
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange('specific')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                    searchType === 'specific'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  disabled={loading || loadingGames}
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
                Selecione a loteria: *
              </label>
              <select
                id="gameSelect"
                className="input"
                value={selectedGame}
                onChange={(e) => handleGameChange(e.target.value)}
                required
                disabled={loading || loadingGames}
              >
                <option value="">
                  {loadingGames ? 'Carregando jogos...' : 'Selecione uma loteria...'}
                </option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.nome}
                  </option>
                ))}
              </select>
              {games.length === 0 && !loadingGames && (
                <p className="text-xs text-red-500 mt-1">
                  Nenhum jogo disponível. Verifique sua conexão.
                </p>
              )}
            </div>

            {/* Número do concurso (apenas se for específico) */}
            {searchType === 'specific' && (
              <div className="mb-6">
                <label htmlFor="contestNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número do concurso: *
                </label>
                <input
                  id="contestNumber"
                  type="text"
                  className="input"
                  placeholder="Ex: 2500"
                  value={contestNumber}
                  onChange={(e) => handleContestNumberChange(e.target.value)}
                  disabled={loading}
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
                className="button-primary w-full py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  loading ||
                  loadingGames ||
                  !selectedGame ||
                  games.length === 0 ||
                  (searchType === 'specific' && (!contestNumber || !isValidContestNumber(contestNumber)))
                }
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin mr-2" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} className="mr-2" />
                    <span>Consultar Resultado</span>
                    <ArrowRight size={20} className="ml-2" />
                  </>
                )}
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