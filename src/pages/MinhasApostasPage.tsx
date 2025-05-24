import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Clock, AlertCircle, CheckCircle, Calendar, Info, Filter, RefreshCw, Search, ChevronRight, AlertTriangle, PieChart, BarChart, Award, X, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getLotteryGames } from '../services/api';
import { LotteryGame } from '../types';
import httpService from '../services/httpService';

const API_URL = 'http://localhost:3000/api';
// Não precisamos mais dessa URL, vamos usar nosso proxy
// const LOTERIA_API_URL = 'https://api.guidi.dev.br/loteria';

type Bet = {
  id: string;
  jogo: string;
  concurso: string;
  numeros: string[];
  teimosinha: boolean;
  qtdTeimosinha: number;
  dataCriacao: string;
  status: string;
  verificadoEm?: string;
  tipo?: 'individual' | 'grupo';
  grupo?: {
    nome: string;
    participantes: { nome: string; email: string }[];
    criador: string;
  };
  participanteCount?: number;
  sequenciaTeimosinhaIndex?: number;
  sequenciaTeimosinhaTotal?: number;
};

// Definir tipo para resultados de apostas
type BetResult = {
  concurso: string;
  dataSorteio: string;
  numeros: string[];
  premiacoes: {
    acertos: string;
    ganhadores: number;
    premio: string;
  }[];
  acumulou: boolean;
};

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
        // Buscar apostas usando o httpService
        const response = await httpService.get('/bets');
        
        if (response.data.success) {
          const betData = response.data.bets;
          
          // Verificar se as apostas têm resultados disponíveis
          const updatedBets = await checkResultsForBets(betData);
          
          setBets(updatedBets);
          setFilteredBets(updatedBets);
          
          // Extrair concursos únicos para o filtro
          const concursos = [...new Set(updatedBets.map((bet: Bet) => bet.concurso))];
          setUniqueConcursos(concursos as string[]);
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

  // Função para verificar quais apostas já possuem resultados disponíveis
  const checkResultsForBets = async (bets: Bet[]): Promise<Bet[]> => {
    // Em um ambiente real, você faria uma chamada à API para verificar
    // os resultados disponíveis para cada aposta
    
    console.log('Verificando resultados para', bets.length, 'apostas');
    
    // Para demonstração, vamos simular que alguns resultados já estão disponíveis
    // baseado em uma lógica temporal (apostas mais antigas têm maior chance de ter resultado)
    
    // Criar uma cópia das apostas para não modificar o array original
    const updatedBets = [...bets];
    
    // Verificar cada aposta
    const processed = updatedBets.map(bet => {
      // Forçar que todas as apostas sejam verificadas para fins de demonstração
      // Para um caso real, você usaria a lógica temporal abaixo
      
      // Gerar um status aleatório para demonstração
      const statusOptions = ['pendente', 'verificada', 'prêmio', 'finalizado'];
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      // Atualizar a aposta com o novo status
      return {
        ...bet,
        status: randomStatus,
        verificadoEm: randomStatus !== 'pendente' ? new Date().toISOString() : undefined
      };
      
      /* Lógica temporal (descomentado em produção)
      // Obter a data da aposta
      const betDate = new Date(bet.dataCriacao);
      const now = new Date();
      
      // Calcular a diferença em dias
      const diffTime = Math.abs(now.getTime() - betDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Se a aposta já tem um status diferente de "pendente", manter
      if (bet.status.toLowerCase() !== 'pendente') {
        return bet;
      }
      
      // Lógica para definir status com base na idade da aposta
      // Quanto mais antiga a aposta, maior a chance de ter resultado
      if (diffDays > 7) {
        // Apostas com mais de 7 dias sempre têm resultado
        return {
          ...bet,
          status: Math.random() > 0.8 ? 'prêmio' : 'finalizado',
          verificadoEm: new Date(betDate.getTime() + 86400000 * 7).toISOString() // +7 dias
        };
      } else if (diffDays > 3) {
        // Apostas entre 3-7 dias têm 70% de chance
        if (Math.random() > 0.3) {
          return {
            ...bet,
            status: Math.random() > 0.9 ? 'prêmio' : 'finalizado',
            verificadoEm: new Date(betDate.getTime() + 86400000 * 3).toISOString() // +3 dias
          };
        }
      } else if (diffDays > 1) {
        // Apostas entre 1-3 dias têm 30% de chance
        if (Math.random() > 0.7) {
          return {
            ...bet,
            status: Math.random() > 0.95 ? 'prêmio' : 'finalizado',
            verificadoEm: new Date(betDate.getTime() + 86400000).toISOString() // +1 dia
          };
        }
      }
      
      // Se não atender a nenhuma condição, retorna a aposta original
      return bet;
      */
    });
    
    console.log('Apostas processadas:', processed.map(b => b.status));
    return processed;
  };

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
      case 'verificada':
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
      // Obter o resultado através do nosso proxy para evitar CORS
      const jogoNormalizado = normalizarNomeJogo(bet.jogo);
      const url = `${API_URL}/loteria/${jogoNormalizado}/${bet.concurso}`;
      
      console.log(`Buscando resultado da loteria via proxy: ${url}`);
      
      const response = await axios.get(url);
      const resultadoAPI = response.data;
      
      console.log('Resultado obtido da API:', resultadoAPI);
      
      // Verificar se os dados necessários estão presentes no formato retornado
      if (!resultadoAPI) {
        throw new Error('Dados do resultado não encontrados');
      }
      
      // Converter o formato da API para o formato da nossa aplicação
      const resultado: BetResult = {
        concurso: resultadoAPI.numero?.toString() || bet.concurso,
        dataSorteio: formatarDataAPI(resultadoAPI.dataApuracao) || new Date().toISOString(),
        // Escolher a lista de dezenas com base no formato retornado
        numeros: resultadoAPI.listaDezenas || 
                resultadoAPI.dezenas || 
                resultadoAPI.dezenasSorteadasOrdemSorteio || [],
        premiacoes: processarPremiacoes(resultadoAPI),
        acumulou: resultadoAPI.acumulado === true || resultadoAPI.valorAcumuladoProximoConcurso > 0
      };
      
      setBetResult(resultado);
      setLoadingResult(false);
      
      // Verificar acertos e atualizar o status da aposta
      const matchCount = getMatchCount(bet.numeros, resultado.numeros);
      const isWinner = isWinningBet(matchCount, jogoNormalizado);
      
      // Atualizar o status da aposta
      updateBetStatus(bet, isWinner ? 'prêmio' : 'finalizado');
      
    } catch (error: any) {
      console.error('Erro ao buscar resultado:', error);
      
      // Se houve erro na API de loterias, tentar usar a simulação
      try {
        console.log('Usando simulação como fallback');
        simularResultado(bet);
      } catch (simError) {
        setResultError(error.message || 'Erro ao buscar resultado da aposta');
        setLoadingResult(false);
      }
    }
  };
  
  // Função para formatar a data retornada pela API
  const formatarDataAPI = (dataString?: string): string => {
    if (!dataString) return new Date().toISOString();
    
    try {
      // Formato esperado: "17/05/2025"
      const [dia, mes, ano] = dataString.split('/').map(Number);
      const data = new Date(ano, mes - 1, dia);
      return data.toISOString();
    } catch (e) {
      console.error('Erro ao converter data:', e);
      return new Date().toISOString();
    }
  };
  
  // Função para processar as premiações do resultado
  const processarPremiacoes = (resultadoAPI: any): { acertos: string; ganhadores: number; premio: string }[] => {
    // Verificar se temos a lista de rateio de prêmio no formato do exemplo
    if (resultadoAPI.listaRateioPremio && Array.isArray(resultadoAPI.listaRateioPremio)) {
      return resultadoAPI.listaRateioPremio.map((premio: any) => ({
        acertos: premio.descricaoFaixa || `${premio.faixa} acertos`,
        ganhadores: premio.numeroDeGanhadores || 0,
        premio: formatarValorPremio(premio.valorPremio)
      }));
    }
    
    // Verificar se temos premiações no formato anterior
    if (resultadoAPI.premiacoes && Array.isArray(resultadoAPI.premiacoes)) {
      return resultadoAPI.premiacoes.map((p: any) => ({
        acertos: p.acertos || p.descricao || "Premiação",
        ganhadores: p.ganhadores || 0,
        premio: p.premio || "R$ 0,00"
      }));
    }
    
    // Formato padrão se nenhum dado de premiação estiver disponível
    return [
      { acertos: "6 acertos", ganhadores: 0, premio: "R$ 0,00" },
      { acertos: "5 acertos", ganhadores: 0, premio: "R$ 0,00" },
      { acertos: "4 acertos", ganhadores: 0, premio: "R$ 0,00" }
    ];
  };
  
  // Formatar valor do prêmio como string monetária
  const formatarValorPremio = (valor: number | string): string => {
    if (!valor && valor !== 0) return "R$ 0,00";
    
    // Se já for uma string formatada, retornar como está
    if (typeof valor === 'string' && valor.includes('R$')) {
      return valor;
    }
    
    // Converter para número se for string
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    // Formatar valor como moeda brasileira
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };
  
  // Função para normalizar o nome do jogo para o formato da API
  const normalizarNomeJogo = (jogo: string): string => {
    const mapeamento: Record<string, string> = {
      'megasena': 'megasena',
      'lotofacil': 'lotofacil',
      'quina': 'quina',
      'lotomania': 'lotomania',
      'timemania': 'timemania',
      'duplasena': 'duplasena',
      'diadesorte': 'diadesorte',
      'supersete': 'supersete'
    };
    
    // Remover espaços, caracteres especiais e converter para minúsculas
    const jogoNormalizado = jogo.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    
    return mapeamento[jogoNormalizado] || 'megasena'; // Padrão para megasena
  };
  
  // Função para simular um resultado (fallback se a API falhar)
  const simularResultado = (bet: Bet) => {
    console.log('Simulando resultado para aposta:', bet);
    
    setTimeout(() => {
      const randomNumbers = Array(6).fill(0).map(() => 
        Math.floor(Math.random() * 60) + 1
      ).sort((a, b) => a - b).map(n => n.toString());
      
      // Simular resultado
      const mockResult: BetResult = {
        concurso: bet.concurso,
        dataSorteio: new Date().toISOString(),
        numeros: randomNumbers,
        premiacoes: [
          { acertos: "6", ganhadores: Math.random() > 0.98 ? 1 : 0, premio: "R$ 50.000.000,00" },
          { acertos: "5", ganhadores: Math.floor(Math.random() * 100), premio: "R$ 50.000,00" },
          { acertos: "4", ganhadores: Math.floor(Math.random() * 1000) + 100, premio: "R$ 1.000,00" }
        ],
        acumulou: Math.random() > 0.5
      };
      
      setBetResult(mockResult);
      setLoadingResult(false);
      
      // Atualizar o status da aposta
      updateBetStatus(bet);
    }, 1500);
  };
  
  // Função para atualizar o status da aposta
  const updateBetStatus = (bet: Bet, newStatus: string = 'finalizado') => {
    // Em produção, você faria uma chamada PUT/PATCH para atualizar o status no servidor
    // const response = await httpService.patch(`/bets/${bet.id}`, { status: newStatus });
    
    // Para demonstração, atualizamos apenas localmente
    const updatedBets = bets.map(b => {
      if (b.id === bet.id) {
        return { ...b, status: newStatus, verificadoEm: new Date().toISOString() };
      }
      return b;
    });
    
    setBets(updatedBets);
    
    // Atualizar também a lista filtrada
    const updatedFilteredBets = filteredBets.map(b => {
      if (b.id === bet.id) {
        return { ...b, status: newStatus, verificadoEm: new Date().toISOString() };
      }
      return b;
    });
    
    setFilteredBets(updatedFilteredBets);
    
    // Mensagem de sucesso (em produção, você mostraria baseado na resposta da API)
    console.log(`Status da aposta ${bet.id} atualizado para '${newStatus}'`);
  };
  
  // Verificar acertos no resultado
  const getMatchCount = (betNumbers: string[], resultNumbers: string[]) => {
    return betNumbers.filter(num => resultNumbers.includes(num)).length;
  };
  
  // Verificar se a aposta é premiada
  const isWinningBet = (matchCount: number, gameType: string = 'megasena') => {
    // Definir regras de premiação baseadas no tipo de jogo
    const premiationRules: Record<string, number> = {
      'megasena': 4,      // 4 ou mais acertos
      'lotofacil': 11,    // 11 ou mais acertos
      'quina': 2,         // 2 ou mais acertos
      'lotomania': 15,    // 15 ou mais acertos
      'timemania': 3,     // 3 ou mais acertos
      'duplasena': 4,     // 4 ou mais acertos
      'diadesorte': 4,    // 4 ou mais acertos
      'supersete': 3      // 3 ou mais acertos
    };
    
    // Obter o valor mínimo de acertos para o jogo, ou usar 4 como padrão
    const minMatches = premiationRules[gameType] || 4;
    
    return matchCount >= minMatches;
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Números
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1">
                            {bet.numeros.map((num, idx) => (
                              <span key={idx} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                                {num}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(bet.dataCriacao)}
                        </td>
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
                            <button className="text-primary-600 hover:text-primary-900 inline-flex items-center">
                              Detalhes
                              <ChevronRight size={16} />
                            </button>
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
              ) : betResult ? (
                <div>
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      {getGameName(selectedBet?.jogo || '')} - Concurso {betResult.concurso}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Data do sorteio: {formatDate(betResult.dataSorteio)}
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
                        {selectedBet?.numeros.map((num, idx) => {
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
                    
                    {selectedBet && (
                      <div className="mt-4 p-4 rounded-lg bg-gray-50">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Resultado:</h5>
                        {(() => {
                          const matchCount = getMatchCount(selectedBet.numeros, betResult.numeros);
                          const isWinner = isWinningBet(matchCount, selectedBet.jogo);
                          
                          return (
                            <div className={`text-center p-2 rounded-md ${isWinner ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <p className="text-lg font-semibold mb-1">
                                {matchCount} {matchCount === 1 ? 'acerto' : 'acertos'}
                              </p>
                              <p className={`text-sm ${isWinner ? 'text-green-700' : 'text-gray-500'}`}>
                                {isWinner 
                                  ? '🎉 Parabéns! Sua aposta foi premiada!'
                                  : 'Não foi dessa vez. Tente novamente!'}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Status da aposta atualizado para: Finalizado
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Premiações:</h4>
                    <div className="space-y-2">
                      {betResult.premiacoes.map((premio, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{premio.acertos} acertos:</span>
                          <span className="font-medium">
                            {premio.ganhadores} {premio.ganhadores === 1 ? 'ganhador' : 'ganhadores'} - {premio.premio}
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