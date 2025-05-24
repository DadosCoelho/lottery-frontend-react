// Tipos para a aplicação de loterias

// Tipo para jogos de loteria
export interface LotteryGame {
  id: string;
  nome: string;
  descricao?: string;
  numerosJogados: number;
  numerosPossiveis: number;
  valorJogo?: number;
  cor?: string;
  icone?: string;
}

// Tipo para apostas
export interface Bet {
  id: string;
  userId: string;
  jogo: string;
  concurso: string;
  numeros: string[];
  teimosinha: boolean;
  qtdTeimosinha: number;
  dataCriacao: string;
  status: string;
}

// Tipo para resultado de loteria
export interface LotteryResult {
  id: string;
  jogo: string;
  concurso: string;
  data: string;
  numeros: string[];
  premiacoes: {
    acertos: string;
    ganhadores: number;
    premio: string;
  }[];
  acumulado: boolean;
  valorAcumulado?: string;
  proxConcurso?: string;
  dataProxConcurso?: string;
}

// Tipo para usuário
export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  profile?: {
    nome: string;
    createdAt: string;
    lastUpdated: string;
  };
}

// Tipo para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Prize information
export interface Prize {
  acertos: string;
  vencedores: number;
  premio: number;
}

// Detailed game information
export interface GameDetails extends LotteryResult {
  loteria: string;
  nome: string;
  acumuladaProxConcurso: number;
  dataProxConcurso: string;
  proxConcurso: number;
  dezenas?: string[];
  rateio?: any[];
  arrecadacaoTotal?: number;
  estimativaProxConcurso?: number;
  acumulado?: boolean;
  // Campos adicionais que podem vir da API
  resultado?: string;
  localSorteio?: string;
  valorEstimadoProximoConcurso?: number;
  valorAcumuladoProximoConcurso?: number;
  // Campos específicos do formato retornado
  listaDezenas?: string[];
  dezenasSorteadasOrdemSorteio?: string[];
  listaRateioPremio?: any[];
  dataApuracao?: string;
  dataProximoConcurso?: string;
  numero?: number;
  numeroConcursoProximo?: number;
  tipoJogo?: string;
  valorArrecadado?: number;
  [key: string]: any; // Para permitir outros campos que podem vir da API
}

// Statistics type
export interface NumberStats {
  number: string;
  frequency: number;
  percentage: number;
  lastAppearance?: string;
}

// Favorite game type
export interface FavoriteGame {
  gameId: string;
  numbers: string[];
  name?: string;
}

// Tipo para o resultado do sorteio salvo na aposta
export type BetResult = {
  concurso: string;
  dataSorteio: string;
  numeros: string[]; // Números sorteados
  premiacoes: {
    acertos: string;
    ganhadores: number;
    premio: string | number; // Pode ser string formatada ou número
  }[];
  acumulou: boolean;
  valorAcumulado?: string;
  proxConcurso?: string;
  dataProxConcurso?: string;
  valorAcumuladoProximoConcurso?: number;
};

// Tipo para apostas
export interface Bet {
  id: string;
  userId: string;
  jogo: string;
  concurso: string;
  numeros: string[]; // Números apostados pelo usuário
  teimosinha: boolean;
  qtdTeimosinha: number;
  dataCriacao: string;
  status: string;
  verificadoEm?: string; // Data/hora da última verificação (opcional)
  tipo?: 'individual' | 'grupo';
  grupo?: {
    nome: string;
    participantes: { nome: string; email: string }[];
    criador: string;
  };
  participanteCount?: number;
  sequenciaTeimosinhaIndex?: number;
  sequenciaTeimosinhaTotal?: number;
  // NOVOS CAMPOS:
  consultado?: boolean; // Indica se o resultado já foi buscado e salvo
  resultadoSorteio?: BetResult; // O resultado do sorteio salvo
}