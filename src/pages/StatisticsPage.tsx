import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Calendar, ArrowDown } from 'lucide-react';
import { getLotteryGames, getLotteryResults } from '../services/api';
import { LotteryGame, LotteryResult, NumberStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import NumberBall from '../components/NumberBall';

const StatisticsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>(gameId || '');
  const [loading, setLoading] = useState(true);
  const [numberStats, setNumberStats] = useState<NumberStats[]>([]);
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'last10' | 'last30' | 'last100'>('all');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
        
        // Set default game if none is selected
        if (!selectedGame && gamesData.length > 0) {
          setSelectedGame(gameId || gamesData[0].id);
          if (!gameId) {
            navigate(`/statistics/${gamesData[0].id}`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error);
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
        try {
          const resultsData = await getLotteryResults(selectedGame);
          setResults(resultsData);
          
          // Calculate statistics for all time by default
          calculateNumberStats(resultsData, 'all');
        } catch (error) {
          console.error('Error fetching results:', error);
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
    navigate(`/statistics/${newGameId}`);
  };

  const handleTimeframeChange = (timeframe: 'all' | 'last10' | 'last30' | 'last100') => {
    setTimeframeFilter(timeframe);
    calculateNumberStats(results, timeframe);
  };

  const calculateNumberStats = (resultsData: LotteryResult[], timeframe: 'all' | 'last10' | 'last30' | 'last100') => {
    if (!resultsData || resultsData.length === 0) return;
    
    // Get subset of results based on timeframe
    let filteredResults = [...resultsData];
    if (timeframe === 'last10') {
      filteredResults = resultsData.slice(0, 10);
    } else if (timeframe === 'last30') {
      filteredResults = resultsData.slice(0, 30);
    } else if (timeframe === 'last100') {
      filteredResults = resultsData.slice(0, 100);
    }
    
    // Initialize number frequency map
    const frequencyMap = new Map<string, number>();
    
    // Count occurrences
    filteredResults.forEach(result => {
      result.numeros.forEach(num => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      });
    });
    
    // Convert to array for sorting
    const statsArray: NumberStats[] = Array.from(frequencyMap.entries()).map(([number, frequency]) => {
      return {
        number,
        frequency,
        percentage: (frequency / filteredResults.length) * 100,
        // Find last appearance
        lastAppearance: findLastAppearance(number, resultsData)
      };
    });
    
    // Sort by frequency (descending)
    statsArray.sort((a, b) => b.frequency - a.frequency);
    
    setNumberStats(statsArray);
  };

  const findLastAppearance = (number: string, resultsData: LotteryResult[]): string => {
    for (const result of resultsData) {
      if (result.numeros.includes(number)) {
        return result.data;
      }
    }
    return 'N/A';
  };

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
  
  const colorClass = selectedGame ? gameColors[selectedGame] || 'bg-primary-600' : 'bg-primary-600';

  const getSelectedGameName = () => {
    const game = games.find(g => g.id === selectedGame);
    return game ? game.nome : 'Selecione um jogo';
  };

  // Calculate hot and cold numbers
  const hotNumbers = numberStats.slice(0, 5); // Top 5 most frequent
  const coldNumbers = [...numberStats].sort((a, b) => a.frequency - b.frequency).slice(0, 5); // 5 least frequent

  return (
    <div className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Estatísticas de Números</h1>
          
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
        </div>

        {/* Game Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{getSelectedGameName()}</h2>
          <p className="text-gray-600">
            Estatísticas de frequência dos números sorteados na {getSelectedGameName()}.
            Utilize estas informações para escolher seus números com mais precisão.
          </p>
        </div>

        {/* Timeframe Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700 font-medium mr-2">Período:</span>
            <button
              onClick={() => handleTimeframeChange('all')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                timeframeFilter === 'all' 
                  ? `${colorClass} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleTimeframeChange('last100')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                timeframeFilter === 'last100' 
                  ? `${colorClass} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 100
            </button>
            <button
              onClick={() => handleTimeframeChange('last30')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                timeframeFilter === 'last30' 
                  ? `${colorClass} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 30
            </button>
            <button
              onClick={() => handleTimeframeChange('last10')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                timeframeFilter === 'last10' 
                  ? `${colorClass} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 10
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size={40} />
          </div>
        ) : (
          <>
            {/* Hot and Cold Numbers Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Hot Numbers */}
              <motion.div
                className="bg-white rounded-lg shadow-sm p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <TrendingUp size={20} className="text-red-500 mr-2" />
                  <h3 className="text-xl font-bold">Números Mais Frequentes</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {hotNumbers.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <NumberBall 
                        number={stat.number}
                        gameColor={colorClass}
                        className="mb-2"
                      />
                      <span className="text-sm font-medium">{stat.frequency}x</span>
                      <span className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Cold Numbers */}
              <motion.div
                className="bg-white rounded-lg shadow-sm p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <ArrowDown size={20} className="text-blue-500 mr-2" />
                  <h3 className="text-xl font-bold">Números Menos Frequentes</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {coldNumbers.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <NumberBall 
                        number={stat.number}
                        gameColor={colorClass}
                        className="mb-2"
                      />
                      <span className="text-sm font-medium">{stat.frequency}x</span>
                      <span className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Frequency Chart */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <BarChart2 size={20} className="text-primary-600 mr-2" />
                <h3 className="text-xl font-bold">Tabela de Frequência</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequência
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Porcentagem
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Aparição
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gráfico
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {numberStats.map((stat, index) => {
                      // Calculate bar width based on percentage relative to highest
                      const maxPercentage = numberStats[0].percentage;
                      const relativeWidth = (stat.percentage / maxPercentage) * 100;
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <NumberBall 
                              number={stat.number}
                              gameColor={colorClass}
                              small
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {stat.frequency}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {stat.percentage.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {stat.lastAppearance}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${colorClass}`}
                                style={{ width: `${relativeWidth}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              className="bg-primary-50 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4">Dicas para Suas Apostas</h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  <span className="font-medium">Combine números quentes e frios:</span> Uma estratégia comum 
                  é utilizar uma mistura de números que aparecem frequentemente com alguns que são mais raros.
                </p>
                <p>
                  <span className="font-medium">Lembre-se:</span> Cada sorteio é independente e todos os números 
                  têm a mesma probabilidade matemática de serem sorteados.
                </p>
                <p>
                  <span className="font-medium">Aposte responsavelmente:</span> Defina um orçamento para suas apostas e 
                  mantenha-se dentro dele. A loteria deve ser encarada como entretenimento.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default StatisticsPage;