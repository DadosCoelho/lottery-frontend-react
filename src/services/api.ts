import axios from 'axios';
import { LotteryGame, GameDetails, LotteryResult } from '../types';

// Base API URL
const API_URL = 'https://api.guidi.dev.br/loteria';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all lottery games
export const getLotteryGames = async (): Promise<LotteryGame[]> => {
  try {
    // Temporariamente retornando uma lista estática de jogos
    // Em um ambiente de produção, isso seria buscado da API
    return [
      {
        id: 'megasena',
        nome: 'Mega-Sena',
        numerosJogados: 6,
        numerosPossiveis: 60,
        cor: '#209869',
        descricao: 'A Mega-Sena paga milhões para o acertador dos 6 números sorteados.'
      },
      {
        id: 'quina',
        nome: 'Quina',
        numerosJogados: 5,
        numerosPossiveis: 80,
        cor: '#260085',
        descricao: 'Concorra a prêmios grandiosos com a Quina.'
      },
      {
        id: 'lotofacil',
        nome: 'Lotofácil',
        numerosJogados: 15,
        numerosPossiveis: 25,
        cor: '#930089',
        descricao: 'A Lotofácil é a loteria mais fácil de ganhar.'
      },
      {
        id: 'lotomania',
        nome: 'Lotomania',
        numerosJogados: 50,
        numerosPossiveis: 100,
        cor: '#F78100',
        descricao: 'A Lotomania oferece 8 faixas de premiação.'
      }
    ];
  } catch (error) {
    console.error('Erro ao carregar jogos de loteria:', error);
    return [];
  }
};

// Get specific contest details or latest contest
export const getContestDetails = async (gameId: string, contestNumber: number): Promise<GameDetails | null> => {
  try {
    // Se o número do concurso for 0, busca o último concurso
    const endpoint = contestNumber === 0 ? `/${gameId}/ultimo` : `/${gameId}/${contestNumber}`;
    const response = await api.get(endpoint);
    
    if (response.status === 200 && response.data) {
      const data = response.data;
      
      // Log para depuração
      console.log("Resposta bruta da API:", JSON.stringify(data));
      
      // Adaptação para o formato específico do JSON retornado
      if (data.listaDezenas && Array.isArray(data.listaDezenas) && data.listaDezenas.length > 0) {
        data.dezenas = data.listaDezenas;
        data.numeros = data.listaDezenas;
      } 
      // Outra possibilidade é usar dezenasSorteadasOrdemSorteio
      else if (data.dezenasSorteadasOrdemSorteio && Array.isArray(data.dezenasSorteadasOrdemSorteio) && data.dezenasSorteadasOrdemSorteio.length > 0) {
        data.dezenas = data.dezenasSorteadasOrdemSorteio;
        data.numeros = data.dezenasSorteadasOrdemSorteio;
      }
      
      // Mapeamento de outros campos relevantes se não existirem
      if (data.listaRateioPremio && Array.isArray(data.listaRateioPremio)) {
        data.premiacoes = data.listaRateioPremio.map((item: any) => ({
          acertos: item.descricaoFaixa,
          vencedores: item.numeroDeGanhadores,
          premio: item.valorPremio
        }));
      }
      
      if (data.dataApuracao && !data.data) {
        data.data = data.dataApuracao;
      }
      
      if (data.dataProximoConcurso && !data.dataProxConcurso) {
        data.dataProxConcurso = data.dataProximoConcurso;
      }
      
      if (data.valorAcumuladoProximoConcurso && !data.acumuladaProxConcurso) {
        data.acumuladaProxConcurso = data.valorAcumuladoProximoConcurso;
      }
      
      if (data.valorEstimadoProximoConcurso && !data.estimativaProxConcurso) {
        data.estimativaProxConcurso = data.valorEstimadoProximoConcurso;
      }
      
      if (data.numero && !data.concurso) {
        data.concurso = data.numero;
      }
      
      if (data.numeroConcursoProximo && !data.proxConcurso) {
        data.proxConcurso = data.numeroConcursoProximo;
      }
      
      if (data.tipoJogo && !data.loteria) {
        data.loteria = data.tipoJogo.toLowerCase();
      }
      
      if (data.tipoJogo && !data.nome) {
        data.nome = data.tipoJogo.replace('_', ' ').split(' ').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      // Garantimos que sempre temos o campo numeros e/ou dezenas como array
      if (!data.numeros || data.numeros.length === 0) {
        data.numeros = data.dezenas || [];
      }
      if (!data.dezenas || data.dezenas.length === 0) {
        data.dezenas = data.numeros || [];
      }
      
      return data;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      let errorMessage = 'Erro ao buscar resultados';
      
      if (status === 404) {
        errorMessage = 'Resultados não encontrados';
      } else if (status === 500) {
        errorMessage = 'Serviço temporariamente indisponível';
      }
      
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Buscar resultados do usuário
export const getUserBets = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axios.get(`${API_URL}/bets`, config);
    
    if (response.data.success) {
      return response.data.bets;
    } else {
      throw new Error(response.data.message || 'Erro ao buscar apostas');
    }
  } catch (error) {
    console.error('Erro ao buscar apostas:', error);
    throw error;
  }
};

// Buscar resultado específico
export const getLotteryResult = async (gameId: string, contestNumber: string): Promise<LotteryResult | null> => {
  try {
    // Em um ambiente de produção, isso seria buscado da API
    // Temporariamente retornando dados simulados
    return {
      id: `${gameId}-${contestNumber}`,
      jogo: gameId,
      concurso: contestNumber,
      data: new Date().toISOString(),
      numeros: ['01', '05', '12', '24', '37', '45'],
      premiacoes: [
        { acertos: 'Sena', ganhadores: 0, premio: 'R$ 0,00' },
        { acertos: 'Quina', ganhadores: 55, premio: 'R$ 42.932,72' },
        { acertos: 'Quadra', ganhadores: 3.383, premio: 'R$ 998,10' }
      ],
      acumulado: true,
      valorAcumulado: 'R$ 45.000.000,00',
      proxConcurso: String(Number(contestNumber) + 1),
      dataProxConcurso: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Erro ao buscar resultado ${gameId} concurso ${contestNumber}:`, error);
    return null;
  }
};

export default api;