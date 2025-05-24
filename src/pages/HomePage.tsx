import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clover, TrendingUp, Search, Clock } from 'lucide-react';
import { getLotteryGames, getLatestContest } from '../services/api';
import { LotteryGame, GameDetails } from '../types';
import GameCard from '../components/GameCard';
import LatestResultsBanner from '../components/LatestResultsBanner';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestResults, setLatestResults] = useState<Map<string, GameDetails>>(new Map());

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
        
        // Fetch latest results for mega-sena, quina, and lotofacil
        const mainGames = ['mega-sena', 'quina', 'lotofacil'];
        const resultsMap = new Map<string, GameDetails>();
        
        for (const gameId of mainGames) {
          const result = await getLatestContest(gameId);
          if (result) {
            resultsMap.set(gameId, result);
          }
        }
        
        setLatestResults(resultsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const mainFeatures = [
    {
      icon: <Clover className="h-8 w-8 text-primary-600" />,
      title: 'Resultados em Tempo Real',
      description: 'Acompanhe os sorteios e veja os resultados assim que são divulgados.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Estatísticas Detalhadas',
      description: 'Análise de frequência dos números e estatísticas para ajudar nas suas apostas.'
    },
    {
      icon: <Search className="h-8 w-8 text-primary-600" />,
      title: 'Busca de Concursos',
      description: 'Encontre facilmente resultados de sorteios anteriores por data ou número.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Histórico Completo',
      description: 'Acesse o histórico completo de todas as loterias oficiais.'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="mt-16">
      {/* Hero Section */}
      <section className="py-10 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Resultados da Loteria em Tempo Real
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Acompanhe os sorteios, veja estatísticas e aumente suas chances com a 
            plataforma mais completa de resultados da loteria.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/results" className="button-primary text-base">
              Ver Últimos Resultados
            </Link>
            <Link to="/statistics" className="button-outline text-base">
              Analisar Estatísticas
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest Results Banner */}
      {latestResults.size > 0 && (
        <LatestResultsBanner results={latestResults} />
      )}

      {/* Features Section */}
      <section className="py-10 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Por que usar nossa plataforma?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos as melhores ferramentas para acompanhar os resultados da loteria
            e aumentar suas chances de ganhar.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section className="py-10 md:py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Jogos Disponíveis</h2>
          <Link to="/results" className="flex items-center text-primary-600 hover:text-primary-800 font-medium">
            Ver Todos <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.slice(0, 6).map((game) => (
            <GameCard key={game.id} game={game} latestResult={latestResults.get(game.id)} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 rounded-xl p-8 my-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Não perca nenhum sorteio!</h2>
          <p className="text-gray-700 mb-6">
            Receba notificações sobre os resultados dos jogos que você acompanha 
            e nunca mais perca um prêmio.
          </p>
          <button className="button-primary">
            Ativar Notificações
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;