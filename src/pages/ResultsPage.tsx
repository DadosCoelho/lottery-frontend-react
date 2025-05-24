import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Calendar, Search, AlertCircle } from 'lucide-react';
import { getLotteryGames, getLotteryResults } from '../services/api';
import { LotteryGame, LotteryResult } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import GameResultCard from '../components/GameResultCard';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ResultsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>(gameId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
        
        // Set default game if none is selected
        if (!selectedGame && gamesData.length > 0) {
          setSelectedGame(gameId || gamesData[0].id);
          if (!gameId) {
            navigate(`/results/${gamesData[0].id}`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Não foi possível carregar a lista de jogos');
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (gameId && gameId !== selectedGame) {
      setSelectedGame(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    const fetchResults = async () => {
      if (selectedGame) {
        setLoading(true);
        setError(null);
        try {
          const resultsData = await getLotteryResults(selectedGame);
          setResults(resultsData);
        } catch (error) {
          console.error('Error fetching results:', error);
          setError(error instanceof Error ? error.message : 'Erro ao carregar resultados');
          setResults([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResults();
  }, [selectedGame]);

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGameId = e.target.value;
    setSelectedGame(newGameId);
    navigate(`/results/${newGameId}`);
    setCurrentPage(1);
    setError(null);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter results based on search query
  const filteredResults = results.filter(result => {
    if (!searchQuery) return true;
    
    // Search by contest number
    if (result.concurso.toString().includes(searchQuery)) return true;
    
    // Search by date
    if (result.data && result.data.includes(searchQuery)) return true;
    
    return false;
  });

  // Get current results for pagination
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getSelectedGameName = () => {
    const game = games.find(g => g.id === selectedGame);
    return game ? game.nome : 'Selecione um jogo';
  };

  const formatDate = (dateString: string) => {
    try {
      // Parse the date from the API format
      const date = parse(dateString, 'dd/MM/yyyy', new Date());
      // Format it to the desired output
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-fetch results for the selected game
    getLotteryResults(selectedGame)
      .then(resultsData => {
        setResults(resultsData);
        setError(null);
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Erro ao carregar resultados');
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Resultados da Loteria</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedGame}
              onChange={handleGameChange}
              className="input bg-white"
            >
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.nome}
                </option>
              ))}
            </select>
            
            <button
              onClick={toggleFilters}
              className="button-outline flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filtros
              <ChevronDown size={16} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por concurso ou data
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: 2145 ou 10/05/2023"
                    className="input pl-10"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateRange"
                    className="input pl-10"
                  />
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{getSelectedGameName()}</h2>
          <p className="text-gray-600">
            Confira todos os resultados dos sorteios da {getSelectedGameName()}.
            Veja se seus números foram sorteados.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <div>
                <h3 className="text-red-800 font-medium">Ocorreu um erro</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="mt-3 text-red-700 hover:text-red-800 font-medium flex items-center"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size={40} />
          </div>
        ) : (
          <>
            {currentResults.length > 0 ? (
              <div className="space-y-4">
                {currentResults.map((result) => (
                  <GameResultCard
                    key={result.concurso}
                    result={result}
                    gameId={selectedGame}
                    formattedDate={formatDate(result.data)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-medium text-gray-700">
                  {error ? 'Não foi possível carregar os resultados' : 'Nenhum resultado encontrado'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchQuery 
                    ? "Tente ajustar seus critérios de busca." 
                    : error 
                      ? "Por favor, tente novamente mais tarde."
                      : "Não há resultados disponíveis para este jogo no momento."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredResults.length > resultsPerPage && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`button-outline p-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Previous page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    // Show 5 pages max, centered around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`button-outline p-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Next page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResultsPage;