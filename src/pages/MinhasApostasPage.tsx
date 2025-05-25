import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Clock, AlertCircle, CheckCircle, Calendar, Info, Filter, RefreshCw, Search, ChevronRight, AlertTriangle, PieChart, BarChart, Award, X, Users } from 'lucide-react';
// axios não é mais necessário aqui se httpService for o único usado
// import axios from 'axios'; 
import { useAuth } from '../contexts/AuthContext';
import { getLotteryGames } from '../services/api';
import httpService from '../services/httpService';
import { LotteryGame, Bet, BetResult } from '../types'; // Importa os tipos do arquivo centralizado


interface FilterOptions {
  game?: string;
  status?: string;
  timeframe?: 'all' | 'week' | 'month' | 'threemonths';
  concurso?: string;
  search?: string;
  tipo?: string;
  teimosinha?: string;
}

interface GameStatistic {
  name: string;
  count: number;
  color: string;
}

const MinhasApostasPage: React.FC = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [uniqueConcursos, setUniqueConcursos] = useState<string[]>([]);

  // Estado para modal de resultados
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [betResult, setBetResult] = useState<BetResult | null>(null);
  const [loadingResult, setLoadingResult] = useState<boolean>(false);
  const [resultError, setResultError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<FilterOptions>({
    game: '',
    status: '',
    timeframe: 'all',
    concurso: '',
    search: '',
    tipo: '',
    teimosinha: ''
  });
  
  // Cores para estatísticas
  const gameColors = [
    "#4f46e5", "#7c3aed", "#2563eb", "#0ea5e9", 
    "#10b981", "#84cc16", "#eab308", "#f59e0b", 
    "#f97316", "#ef4444", "#ec4899", "#8b5cf6"
  ];
  
  // Carregar jogos para filtros
  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesData = await getLotteryGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Erro ao carregar jogos:', error);
      }
    };

    loadGames();
  }, []);

  // Buscar apostas
  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      try {
        const response = await httpService.get('/bets');

        if (response.data.success) {
          const betData: Bet[] = response.data.bets;
          setBets(betData);
          setFilteredBets(betData);

          const concursos = [...new Set(betData.map((bet: Bet) => bet.concurso))];
          setUniqueConcursos(concursos as string[]);

          // Atualizar status das apostas não consultadas
          const betsToUpdate = betData.filter(bet => !bet.consultado);
          if (betsToUpdate.length > 0) {
            await Promise.all(
              betsToUpdate.map(async (bet) => {
                try {
                  const res = await httpService.get(`/bets/check-and-save-result/${bet.id}`);
                  if (res.data.success && res.data.result) {
                    setBets(prev =>
                      prev.map(b =>
                        b.id === bet.id
                          ? {
                              ...b,
                              consultado: true,
                              resultadoSorteio: res.data.result,
                              status: res.data.status,
                              verificadoEm: new Date().toISOString(),
                            }
                          : b
                      )
                    );
                  }
                } catch (e) {
                  // Silencie erros individuais para não travar a tela
                  console.error(`Erro ao atualizar aposta ${bet.id}:`, e);
                }
              })
            );
          }
        } else {
          setError(response.data.message || 'Erro ao carregar apostas');
        }
      } catch (error: any) {
        console.error('Erro ao carregar apostas:', error);
        if (error.response?.status === 401) {
          setError('Erro de autenticação. Por favor, faça login novamente.');
        } else {
          setError(error.response?.data?.message || 'Erro ao carregar apostas. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (bets.length === 0) return;
    
    let result = [...bets];
    
    // Filtrar por jogo
    if (filters.game) {
      result = result.filter(bet => bet.jogo === filters.game);
    }
    
    // Filtrar por status
    if (filters.status) {
      result = result.filter(bet => bet.status.toLowerCase() === filters.status?.toLowerCase());
    }
    
    // Filtrar por tipo de aposta
    if (filters.tipo) {
      result = result.filter(bet => bet.tipo === filters.tipo);
    }
    
    // Filtrar por teimosinha
    if (filters.teimosinha) {
      if (filters.teimosinha === 'sim') {
        result = result.filter(bet => bet.teimosinha && bet.qtdTeimosinha > 1);
      } else if (filters.teimosinha === 'nao') {
        result = result.filter(bet => !bet.teimosinha || bet.qtdTeimosinha <= 1);
      }
    }
    
    // Filtrar por concurso
    if (filters.concurso) {
      result = result.filter(bet => bet.concurso === filters.concurso);
    }
    
    // Filtrar por período
    if (filters.timeframe !== 'all') {
      const now = new Date();
      let compareDate = new Date();
      
      if (filters.timeframe === 'week') {
        compareDate.setDate(now.getDate() - 7); // Última semana
      } else if (filters.timeframe === 'month') {
        compareDate.setMonth(now.getMonth() - 1); // Último mês
      } else if (filters.timeframe === 'threemonths') {
        compareDate.setMonth(now.getMonth() - 3); // Últimos 3 meses
      }
      
      result = result.filter(bet => new Date(bet.dataCriacao) >= compareDate);
    }
    
    // Filtrar por texto (pesquisa)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(bet => 
        bet.concurso.toLowerCase().includes(searchTerm) ||
        bet.jogo.toLowerCase().includes(searchTerm) ||
        bet.numeros.join(',').toLowerCase().includes(searchTerm) ||
        bet.status.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredBets(result);
  }, [filters, bets]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      game: '',
      status: '',
      timeframe: 'all',
      concurso: '',
      search: '',
      tipo: '',
      teimosinha: ''
    });
  };

  // Formatação da data de criação
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter o status da aposta com ícone
  const getBetStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return { 
          icon: <Clock size={16} className="text-yellow-500" />,
          text: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'verificada': // Este status pode ser removido se o backend sempre for para 'prêmio' ou 'finalizado'
        return { 
          icon: <CheckCircle size={16} className="text-green-500" />,
          text: 'Verificada',
          className: 'bg-green-100 text-green-800'
        };
      case 'prêmio':
        return { 
          icon: <Ticket size={16} className="text-blue-500" />,
          text: 'Premiada',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'finalizado':
        return { 
          icon: <Award size={16} className="text-purple-500" />,
          text: 'Finalizado',
          className: 'bg-purple-100 text-purple-800'
        };
      default:
        return { 
          icon: <Info size={16} className="text-gray-500" />,
          text: status,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  // Encontrar nome do jogo baseado no ID
  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.nome : gameId;
  };

  // Obter estatísticas básicas
  const getTotalBets = () => filteredBets.length;
  const getPendingBets = () => filteredBets.filter(bet => bet.status.toLowerCase() === 'pendente').length;
  const getVerifiedBets = () => filteredBets.filter(bet => bet.status.toLowerCase() === 'verificada').length;
  const getPrizeBets = () => filteredBets.filter(bet => bet.status.toLowerCase() === 'prêmio').length;
  const getFinishedBets = () => filteredBets.filter(bet => bet.status.toLowerCase() === 'finalizado').length;
  
  // Obter estatísticas por jogo
  const getGameStatistics = (): GameStatistic[] => {
    const gameStats: Record<string, number> = {};
    
    filteredBets.forEach(bet => {
      const gameName = getGameName(bet.jogo);
      gameStats[gameName] = (gameStats[gameName] || 0) + 1;
    });
    
    const colors = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];
    
    return Object.entries(gameStats)
      .map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  const getBetTypeStatistics = (): GameStatistic[] => {
    const typeStats: Record<string, number> = {
      'Individual': filteredBets.filter(bet => bet.tipo !== 'grupo').length,
      'Em Grupo': filteredBets.filter(bet => bet.tipo === 'grupo').length
    };
    
    return [
      { name: 'Individual', count: typeStats['Individual'], color: '#3B82F6' },
      { name: 'Em Grupo', count: typeStats['Em Grupo'], color: '#8B5CF6' }
    ];
  };
  
  // Obter estatísticas por status
  const getStatusStatistics = () => {
    const pendentes = getPendingBets();
    const verificadas = getVerifiedBets();
    const premiadas = getPrizeBets();
    const finalizadas = getFinishedBets();
    
    return [
      { name: 'Pendentes', count: pendentes, color: '#eab308' },
      { name: 'Verificadas', count: verificadas, color: '#10b981' },
      { name: 'Premiadas', count: premiadas, color: '#3b82f6' },
      { name: 'Finalizadas', count: finalizadas, color: '#8b5cf6' }
    ];
  };
  
  // Atualizar valor de um filtro
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Função para verificar o resultado de uma aposta
  const checkBetResult = async (bet: Bet) => {
    setSelectedBet(bet);
    setShowResultModal(true);
    setLoadingResult(true);
    setResultError(null);
    setBetResult(null);

    try {
      let fetchedResultData: BetResult | null = null;
      let newBetStatus: string = bet.status; // Para armazenar o status retornado pelo backend

      // 1. Se o resultado já foi consultado e está salvo, usa os dados salvos
      if (bet.consultado && bet.resultadoSorteio) {
        console.log('[Frontend] Resultado já consultado, usando dados salvos.');
        fetchedResultData = bet.resultadoSorteio;
        newBetStatus = bet.status; // Usa o status que já está no objeto da aposta
      } else {
        // 2. Se não foi consultado, chama o novo endpoint do backend para buscar e salvar
        console.log('[Frontend] Resultado não consultado, chamando backend para buscar e salvar.');
        const response = await httpService.get(`/bets/check-and-save-result/${bet.id}`);

        if (response.data.success && response.data.result) {
          fetchedResultData = response.data.result;
          newBetStatus = response.data.status; // O backend agora retorna o status atualizado!

          // Atualiza o objeto da aposta localmente para refletir o resultado salvo e o status 'consultado'
          setBets(prevBets => prevBets.map(b =>
                      b.id === bet.id ? { ...b, consultado: true, resultadoSorteio: fetchedResultData ?? undefined, status: newBetStatus, verificadoEm: new Date().toISOString() } : b
                    ));
          setFilteredBets(prevFilteredBets => prevFilteredBets.map(b =>
                      b.id === bet.id ? { ...b, consultado: true, resultadoSorteio: fetchedResultData ?? undefined, status: newBetStatus, verificadoEm: new Date().toISOString() } : b
                    ));
        } else {
          throw new Error(response.data.message || 'Erro ao buscar resultado da aposta.');
        }
      }

      if (!fetchedResultData) {
        throw new Error('Não foi possível obter o resultado da aposta.');
      }

      setBetResult(fetchedResultData);
      setLoadingResult(false);

      updateBetStatusLocal(bet.id, newBetStatus); // Chama uma função para atualizar o status localmente
      
    } catch (error: any) {
      console.error('[Frontend] Erro ao buscar resultado:', error);
      let errorMessage = 'Erro ao buscar resultado da aposta.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setResultError(errorMessage);
      setLoadingResult(false);
    }
  };

  // Função para atualizar o status da aposta apenas no estado local do React
  const updateBetStatusLocal = (betId: string, newStatus: string) => {
    setBets(prevBets => prevBets.map(b =>
      b.id === betId ? { ...b, status: newStatus } : b
    ));
    setFilteredBets(prevFilteredBets => prevFilteredBets.map(b =>
      b.id === betId ? { ...b, status: newStatus } : b
    ));
  };
  
  // Funções auxiliares para o MODAL (apenas para exibição, não para determinar status persistido)
  // Estas funções são mantidas no frontend para calcular e exibir os acertos no modal.
  const getMatchCountForDisplay = (betNumbers: string[], resultNumbers: string[]) => {
    const betNums = Array.isArray(betNumbers) ? betNumbers.map(String) : [];
    const resultNums = Array.isArray(resultNumbers) ? resultNumbers.map(String) : [];
    return betNums.filter(num => resultNums.includes(num)).length;
  };
  
  // Função para formatar a data retornada pela API (se necessário para o modal)
  const formatarDataAPI = (dataString?: string): string => {
    if (!dataString) return new Date().toLocaleDateString('pt-BR'); // Retorna data atual formatada
    
    try {
      // Tenta parsear como ISO string primeiro
      const isoDate = new Date(dataString);
      if (!isNaN(isoDate.getTime())) {
        return isoDate.toLocaleDateString('pt-BR');
      }
      
      // Se não for ISO, tenta formato "dd/MM/yyyy"
      const parts = dataString.split('/');
      if (parts.length === 3) {
        const [dia, mes, ano] = parts.map(Number);
        const data = new Date(ano, mes - 1, dia);
        if (!isNaN(data.getTime())) {
          return data.toLocaleDateString('pt-BR');
        }
      }
      
      return dataString; // Retorna a string original se não conseguir formatar
    } catch (e) {
      console.error('Erro ao converter data para exibição:', e);
      return dataString;
    }
  };
  
  // Função para formatar valor do prêmio como string monetária (para o modal)
  const formatarValorPremio = (valor: number | string): string => {
    if (valor === null || valor === undefined) return "R$ 0,00";
    
    // Se já for uma string formatada, retornar como está
    if (typeof valor === 'string' && valor.includes('R$')) {
      return valor;
    }
    
    // Converter para número se for string
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    
    // Formatar valor como moeda brasileira
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };
  
  // Função para normalizar o nome do jogo (se necessário para o modal, mas já vem do backend)
  // Mantida para consistência, mas o nome já deve vir formatado do backend
  const normalizarNomeJogo = (jogo: string): string => {
    const mapeamento: Record<string, string> = {
      'mega-sena': 'megasena',
      'lotofacil': 'lotofacil',
      'quina': 'quina',
      'lotomania': 'lotomania',
      'timemania': 'timemania',
      'dupla-sena': 'duplasena',
      'dia-de-sorte': 'diadesorte',
      'super-sete': 'supersete'
    };
    
    const jogoNormalizado = jogo.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    
    return mapeamento[jogoNormalizado] || jogo; // Retorna o original se não mapear
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Ticket className="mr-2" /> Minhas Apostas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe todas as suas apostas
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <Filter size={16} />
            <span>Filtros</span>
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-1 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <PieChart size={16} />
            <span>Estatísticas</span>
          </button>
        </div>
      </div>

      {/* Área de pesquisa */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar apostas (números, concurso, jogo...)"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm mb-6 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jogo</label>
              <select
                value={filters.game || ''}
                onChange={(e) => updateFilter('game', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os jogos</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="verificada">Verificada</option>
                <option value="prêmio">Premiada</option>
                <option value="finalizado">Finalizado</option> {/* Adicionado para filtro */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concurso</label>
              <select
                value={filters.concurso || ''}
                onChange={(e) => updateFilter('concurso', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os concursos</option>
                {uniqueConcursos.map(concurso => (
                  <option key={concurso} value={concurso}>{concurso}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                value={filters.timeframe || 'all'}
                onChange={(e) => updateFilter('timeframe', e.target.value || 'all')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os períodos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="threemonths">Últimos 3 meses</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Aposta</label>
              <select
                value={filters.tipo || ''}
                onChange={(e) => updateFilter('tipo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os tipos</option>
                <option value="individual">Individual</option>
                <option value="grupo">Em Grupo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teimosinha</label>
              <select
                value={filters.teimosinha || ''}
                onChange={(e) => updateFilter('teimosinha', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas as apostas</option>
                <option value="sim">Apenas teimosinhas</option>
                <option value="nao">Apostas simples</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 py-2 px-4 text-gray-700 hover:text-gray-900"
            >
              <RefreshCw size={16} />
              <span>Limpar filtros</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Estatísticas */}
      {showStats && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm mb-6 overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas das suas apostas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <BarChart size={16} className="mr-1" /> Apostas por jogo
              </h4>
              <div className="space-y-2">
                {getGameStatistics().map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 truncate">{stat.name}</div>
                    <div className="flex-1 mx-2">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(stat.count / getTotalBets()) * 100}%`,
                            backgroundColor: stat.color
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-8 text-right">{stat.count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <PieChart size={16} className="mr-1" /> Apostas por status
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {getStatusStatistics().map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: stat.color + '20', color: stat.color }}
                    >
                      {index === 0 && <Clock size={20} />}
                      {index === 1 && <CheckCircle size={20} />}
                      {index === 2 && <Ticket size={20} />}
                    </div>
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</div>
                    <div className="text-xs text-gray-600">{stat.name}</div>
                  </div>
                ))}
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-gray-200 text-gray-700">
                    <Info size={20} />
                  </div>
                  <div className="text-2xl font-bold text-gray-700">{getTotalBets()}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Users size={16} className="mr-1" /> Tipos de apostas
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {getBetTypeStatistics().map((stat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: stat.color + '20', color: stat.color }}
                  >
                    {index === 0 ? <Ticket size={20} /> : <Users size={20} />}
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.count}</div>
                    <div className="text-xs text-gray-600">{stat.name}</div>
                  </div>
                  <div className="ml-auto">
                    <div className="text-sm text-gray-500">
                      {Math.round((stat.count / getTotalBets()) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Ticket size={16} className="mr-1" /> Apostas teimosinha
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                  <Ticket size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {filteredBets.filter(bet => bet.teimosinha && bet.qtdTeimosinha > 1).length}
                  </div>
                  <div className="text-xs text-gray-600">Total de apostas teimosinha</div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-green-100 text-green-600">
                  <BarChart size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {new Set(filteredBets.filter(bet => bet.teimosinha && bet.qtdTeimosinha > 1)
                      .map(bet => `${bet.jogo}-${bet.numeros.join(',')}-${Math.floor(parseInt(bet.concurso) / bet.qtdTeimosinha)}`)).size}
                  </div>
                  <div className="text-xs text-gray-600">Sequências teimosinha distintas</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabela de apostas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Suas apostas</h3>
          <button 
            onClick={() => {
              setLoading(true);
              httpService.get('/bets')
                .then(response => {
                  if (response.data.success) {
                    const betData = response.data.bets;
                    setBets(betData);
                    setFilteredBets(betData);
                    setError(null);
                  } else {
                    setError(response.data.message || 'Erro ao carregar apostas');
                  }
                })
                .catch(err => {
                  console.error('Erro ao recarregar apostas:', err);
                  setError(err.response?.data?.message || 'Erro ao carregar apostas');
                })
                .finally(() => setLoading(false));
            }}
            className="flex items-center space-x-1 text-sm py-1 px-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw size={14} className="mr-1" />
            <span>Atualizar</span>
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-gray-600">Carregando suas apostas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
            <p className="text-red-600">{error}</p>
            <button 
              className="mt-4 text-primary-600 hover:text-primary-700 underline flex items-center justify-center mx-auto"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} className="mr-1" /> Tentar novamente
            </button>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Nenhuma aposta encontrada</h3>
            <p className="text-gray-500 mb-4">
              {filters.game || filters.status || filters.concurso || filters.timeframe !== 'all' || filters.search 
                ? 'Tente remover alguns filtros para ver mais resultados.'
                : 'Você ainda não registrou nenhuma aposta.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jogo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concurso
                    </th>
                    {/* Removido: Números */}
                    {/* Removido: Data */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBets.map((bet) => {
                    const status = getBetStatus(bet.status);
                    return (
                      <tr key={bet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {getGameName(bet.jogo)}
                              {bet.tipo === 'grupo' && (
                                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  <Users size={12} className="mr-0.5" />
                                  Grupo
                                </span>
                              )}
                              {bet.teimosinha && bet.qtdTeimosinha > 1 && (
                                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  <Ticket size={12} className="mr-0.5" />
                                  Teimosinha {bet.sequenciaTeimosinhaIndex !== undefined ? 
                                    `${bet.sequenciaTeimosinhaIndex + 1}/${bet.sequenciaTeimosinhaTotal}` : 
                                    `${bet.qtdTeimosinha}x`}
                                </span>
                              )}
                            </div>
                          </div>
                          {bet.tipo === 'grupo' && bet.grupo && (
                            <div className="text-xs text-gray-500 mt-1">
                              Grupo: {bet.grupo.nome} ({bet.participanteCount || bet.grupo.participantes?.length || 0} participantes)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            {bet.concurso}
                          </div>
                        </td>
                        {/* Removido: Números */}
                        {/* Removido: Data */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.icon}
                            <span className="ml-1">{status.text}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => checkBetResult(bet)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            >
                              <Award size={16} className="mr-1" />
                              Resultado
                            </button>
                            {/* Removido: Detalhes */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredBets.length}</span> de <span className="font-medium">{bets.length}</span> apostas
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal de Resultados */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award size={18} className="mr-2 text-primary-600" />
                Resultado do Concurso
              </h3>
              <button 
                onClick={() => setShowResultModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              {loadingResult ? (
                <div className="py-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-gray-600">Verificando resultado...</p>
                </div>
              ) : resultError ? (
                <div className="py-6 text-center">
                  <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
                  <p className="text-red-600">{resultError}</p>
                </div>
              ) : betResult && selectedBet ? ( // Adicionado selectedBet para garantir acesso aos números da aposta
                <div>
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      {getGameName(selectedBet.jogo || '')} - Concurso {betResult.concurso}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Data do sorteio: {formatarDataAPI(betResult.dataSorteio)}
                    </p>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Números sorteados:</h5>
                      <div className="flex flex-wrap gap-2">
                        {betResult.numeros.map((num, idx) => (
                          <span key={idx} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-medium">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Seus números:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedBet.numeros.map((num, idx) => {
                          const isMatch = betResult.numeros.includes(num);
                          return (
                            <span 
                              key={idx} 
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                                isMatch ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {num}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 rounded-lg bg-gray-50">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Resultado:</h5>
                      {(() => {
                        // Calcula acertos para exibição no modal
                        const matchCount = getMatchCountForDisplay(selectedBet.numeros, betResult.numeros);
                        // O status principal vem do backend
                        const isWinnerStatus = selectedBet.status === 'prêmio';
                        
                        return (
                          <div className={`text-center p-2 rounded-md ${isWinnerStatus ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <p className="text-lg font-semibold mb-1">
                              {matchCount} {matchCount === 1 ? 'acerto' : 'acertos'}
                            </p>
                            <p className={`text-sm ${isWinnerStatus ? 'text-green-700' : 'text-gray-500'}`}>
                              {isWinnerStatus 
                                ? '🎉 Parabéns! Sua aposta foi premiada!'
                                : 'Não foi dessa vez. Tente novamente!'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Status da aposta: {getBetStatus(selectedBet.status).text}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Premiações:</h4>
                    <div className="space-y-2">
                      {betResult.premiacoes.map((premio, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{premio.acertos} acertos:</span>
                          <span className="font-medium">
                            {premio.ganhadores} {premio.ganhadores === 1 ? 'ganhador' : 'ganhadores'} - {formatarValorPremio(premio.premio)}
                          </span>
                        </div>
                      ))}
                      {betResult.acumulou && (
                        <div className="text-sm text-right mt-1 font-semibold text-primary-600">
                          Prêmio acumulado!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MinhasApostasPage;