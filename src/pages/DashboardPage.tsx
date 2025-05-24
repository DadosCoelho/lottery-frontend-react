import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Award, Archive, Search, Calendar, BarChart, X, Plus, Ticket, CheckSquare, AlertCircle, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLotteryGames } from '../services/api';
import { LotteryGame } from '../types';
import httpService, { API_URL } from '../services/httpService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formulário de aposta
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [contestNumber, setContestNumber] = useState<string>('');
  const [gameNumbers, setGameNumbers] = useState<string>('');
  const [isTeimosinha, setIsTeimosinha] = useState<boolean>(false);
  const [teimosinhaCount, setTeimosinhaCount] = useState<string>('1');
  
  // Dados para aposta em grupo
  const [groupName, setGroupName] = useState<string>('');
  const [participants, setParticipants] = useState<{id: string, name: string, email: string}[]>([]);
  const [newParticipantName, setNewParticipantName] = useState<string>('');
  const [newParticipantEmail, setNewParticipantEmail] = useState<string>('');

  // Carregar a lista de jogos
  React.useEffect(() => {
    const loadGames = async () => {
      const gamesData = await getLotteryGames();
      setGames(gamesData);
      if (gamesData.length > 0) {
        setSelectedGame(gamesData[0].id);
      }
    };
    loadGames();
  }, []);

  // Formatação da data para exibir quando o usuário foi registrado
  const formattedDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Abrir modal de apostas
  const openBetModal = () => {
    setShowModal(true);
    setSuccessMessage(null);
    setError(null);
  };

  // Fechar modal de apostas
  const closeBetModal = () => {
    setShowModal(false);
    setSelectedGame(games.length > 0 ? games[0].id : '');
    setContestNumber('');
    setGameNumbers('');
    setIsTeimosinha(false);
    setTeimosinhaCount('1');
    setError(null);
  };

  // Abrir modal de apostas em grupo
  const openGroupBetModal = () => {
    setShowGroupModal(true);
    setSuccessMessage(null);
    setError(null);
  };

  // Fechar modal de apostas em grupo
  const closeGroupBetModal = () => {
    setShowGroupModal(false);
    setSelectedGame(games.length > 0 ? games[0].id : '');
    setContestNumber('');
    setGameNumbers('');
    setIsTeimosinha(false);
    setTeimosinhaCount('1');
    setGroupName('');
    setParticipants([]);
    setNewParticipantName('');
    setNewParticipantEmail('');
    setError(null);
  };

  // Adicionar participante
  const addParticipant = () => {
    if (!newParticipantName || !newParticipantEmail) {
      setError('Preencha o nome e email do participante');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newParticipantEmail)) {
      setError('Por favor, insira um email válido');
      return;
    }
    
    // Verificar se o email já existe na lista
    if (participants.some(p => p.email === newParticipantEmail)) {
      setError('Este email já foi adicionado');
      return;
    }
    
    // Adicionar novo participante
    setParticipants([
      ...participants, 
      {
        id: Date.now().toString(), // ID temporário
        name: newParticipantName,
        email: newParticipantEmail
      }
    ]);
    
    // Limpar campos
    setNewParticipantName('');
    setNewParticipantEmail('');
    setError(null);
  };

  // Remover participante
  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Submeter o formulário de apostas
  const handleBetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedGame || !contestNumber || !gameNumbers) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Validar formato dos números
      const numbersArray = gameNumbers.split(',').map(n => n.trim());
      if (numbersArray.some(n => isNaN(Number(n)))) {
        setError('Por favor, insira apenas números separados por vírgula.');
        setLoading(false);
        return;
      }

      // Preparar os dados da aposta
      const betData = {
        jogo: selectedGame,
        concurso: contestNumber,
        numeros: numbersArray,
        teimosinha: isTeimosinha,
        qtdTeimosinha: isTeimosinha ? parseInt(teimosinhaCount) : 1
      };

      console.log('Enviando aposta:', betData);
      
      // Usar o httpService em vez de axios diretamente
      const response = await httpService.post('/bets', betData);
      
      if (response.data.success) {
        // Aposta registrada com sucesso
        const gameName = games.find(g => g.id === selectedGame)?.nome || selectedGame;
        const qtdApostas = isTeimosinha ? parseInt(teimosinhaCount) : 1;
        
        if (isTeimosinha && qtdApostas > 1) {
          setSuccessMessage(`${qtdApostas} apostas teimosinha ${gameName} (começando no concurso #${contestNumber}) registradas com sucesso!`);
        } else {
          setSuccessMessage(`Aposta ${gameName} #${contestNumber} registrada com sucesso!`);
        }
        
        // Limpar o formulário após o sucesso
        setGameNumbers('');
        setContestNumber('');
      } else {
        setError(response.data.message || 'Erro ao registrar aposta');
      }
    } catch (error: any) {
      console.error('Erro ao registrar aposta:', error);
      
      // Exibir mensagem de erro apropriada
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Verificar se é erro de autenticação
        if (status === 401) {
          setError('Erro de autenticação. Por favor, faça login novamente.');
          console.error('Erro 401: Não autorizado');
        } 
        // Verificar se é erro de permissão
        else if (status === 500 && errorData.error && errorData.error.includes('PERMISSION_DENIED')) {
          setError('Erro de permissão ao salvar aposta. Por favor, contate o suporte.');
          console.error('Erro de permissão no Firebase:', errorData.error);
        }
        // Outros erros com resposta
        else {
          setError(errorData.message || 'Erro ao registrar aposta. Tente novamente.');
        }
      } else if (error.request) {
        // Erro de conexão com o servidor
        setError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        // Erro genérico
        setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submeter o formulário de apostas em grupo
  const handleGroupBetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedGame || !contestNumber || !gameNumbers || !groupName) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      if (participants.length < 2) {
        setError('Adicione pelo menos 2 participantes para formar um grupo.');
        setLoading(false);
        return;
      }

      // Validar formato dos números
      const numbersArray = gameNumbers.split(',').map(n => n.trim());
      if (numbersArray.some(n => isNaN(Number(n)))) {
        setError('Por favor, insira apenas números separados por vírgula.');
        setLoading(false);
        return;
      }

      // Preparar os dados da aposta em grupo
      const groupBetData = {
        jogo: selectedGame,
        concurso: contestNumber,
        numeros: numbersArray,
        teimosinha: isTeimosinha,
        qtdTeimosinha: isTeimosinha ? parseInt(teimosinhaCount) : 1,
        grupo: {
          nome: groupName,
          participantes: participants.map(p => ({ nome: p.name, email: p.email })),
          criador: user?.email || ''
        }
      };

      console.log('Enviando aposta em grupo:', groupBetData);
      
      // Enviar os dados para a API
      const response = await httpService.post('/bets/group', groupBetData);
      
      if (response.data.success) {
        const gameName = games.find(g => g.id === selectedGame)?.nome || selectedGame;
        const qtdApostas = isTeimosinha ? parseInt(teimosinhaCount) : 1;
        
        if (isTeimosinha && qtdApostas > 1) {
          setSuccessMessage(`${qtdApostas} apostas teimosinha em grupo "${groupName}" (${gameName}, começando no concurso #${contestNumber}) registradas com sucesso para ${participants.length} participantes!`);
        } else {
          setSuccessMessage(`Aposta em grupo "${groupName}" (${gameName} #${contestNumber}) registrada com sucesso para ${participants.length} participantes!`);
        }
        
        // Limpar o formulário após o sucesso
        setGameNumbers('');
        setContestNumber('');
      } else {
        setError(response.data.message || 'Erro ao registrar aposta em grupo');
      }
      
    } catch (error: any) {
      console.error('Erro ao registrar aposta em grupo:', error);
      
      // Exibir mensagem de erro apropriada
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Verificar se é erro de autenticação
        if (status === 401) {
          setError('Erro de autenticação. Por favor, faça login novamente.');
        } 
        // Verificar se é erro de permissão
        else if (status === 500 && errorData.error && errorData.error.includes('PERMISSION_DENIED')) {
          setError('Erro de permissão ao salvar aposta. Por favor, contate o suporte.');
        }
        // Outros erros com resposta
        else {
          setError(errorData.message || 'Erro ao registrar aposta em grupo. Tente novamente.');
        }
      } else if (error.request) {
        // Erro de conexão com o servidor
        setError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        // Erro genérico
        setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      }
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao Sistema de Loterias</h1>
        <p className="text-gray-600">Consulte resultados e estatísticas de todas as loterias</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card de informações do usuário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-6 col-span-1"
        >
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Perfil do Usuário</h3>
              <p className="text-gray-500 text-sm">Suas informações</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center border-b border-gray-100 pb-3">
              <Mail size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center border-b border-gray-100 pb-3">
              <Award size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium flex items-center">
                  {user?.emailVerified ? (
                    <>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verificado</span>
                    </>
                  ) : (
                    <>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Não verificado</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center pb-3">
              <Calendar size={18} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Data de registro</p>
                <p className="font-medium">{formattedDate()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card de acesso rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6 col-span-1 md:col-span-2"
        >
          <div className="flex items-center mb-6">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Archive size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Acesso Rápido</h3>
              <p className="text-gray-500 text-sm">Selecione uma opção para começar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/resultados')}
              className="card bg-blue-50 hover:bg-blue-100 transition-colors p-4 flex items-center border-none"
            >
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Search size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Consultar Resultados</h4>
                <p className="text-sm text-gray-600">Veja os últimos resultados das loterias</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/estatisticas')}
              className="card bg-purple-50 hover:bg-purple-100 transition-colors p-4 flex items-center border-none"
            >
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <BarChart size={20} className="text-purple-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Estatísticas</h4>
                <p className="text-sm text-gray-600">Análise estatística dos sorteios</p>
              </div>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/consulta')}
              className="button-primary w-full py-3"
            >
              Consultar Novos Resultados
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={openBetModal}
                className="button bg-green-600 hover:bg-green-700 text-white w-full py-3 flex items-center justify-center"
              >
                <Ticket size={18} className="mr-2" />
                Aposta Simples
              </button>
              
              <button 
                onClick={openGroupBetModal}
                className="button bg-purple-600 hover:bg-purple-700 text-white w-full py-3 flex items-center justify-center"
              >
                <Users size={18} className="mr-2" />
                Aposta em Grupo
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Resumo e informações extras */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total de Loterias</p>
            <p className="text-2xl font-bold text-gray-900">11</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Último Acesso</p>
            <p className="text-2xl font-bold text-gray-900">{formattedDate()}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Status da API</p>
            <p className="flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="font-medium text-green-600">Online</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal de Aposta Simples */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Ticket className="mr-2" size={20} />
                  Criar Aposta Simples
                </h3>
                <button 
                  onClick={closeBetModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {successMessage ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4 flex items-start">
                  <CheckSquare className="mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-medium">{successMessage}</p>
                    <p className="text-sm mt-1">Você pode criar outra aposta ou fechar esta janela.</p>
                    <div className="mt-4 flex space-x-4">
                      <button 
                        onClick={() => {
                          setSuccessMessage(null);
                          setContestNumber('');
                          setGameNumbers('');
                        }}
                        className="button-outline text-sm py-1"
                      >
                        <Plus size={16} className="mr-1" />
                        Nova Aposta
                      </button>
                      <button 
                        onClick={closeBetModal}
                        className="button-primary text-sm py-1"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBetSubmit} className="space-y-4">
                  {/* Tipo de Concurso */}
                  <div>
                    <label htmlFor="gameSelect" className="block text-sm font-medium text-gray-700 mb-1">
                      Concurso/Loteria
                    </label>
                    <select
                      id="gameSelect"
                      className="input"
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      required
                    >
                      {games.length === 0 && (
                        <option value="">Carregando...</option>
                      )}
                      {games.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número do Concurso */}
                  <div>
                    <label htmlFor="contestNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número do Concurso
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
                      Digite o número do concurso que deseja apostar
                    </p>
                  </div>

                  {/* Números do Jogo */}
                  <div>
                    <label htmlFor="gameNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                      Números do Jogo
                    </label>
                    <input
                      id="gameNumbers"
                      type="text"
                      className="input"
                      placeholder="Ex: 01,05,12,24,37,45"
                      value={gameNumbers}
                      onChange={(e) => setGameNumbers(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite os números separados por vírgula
                    </p>
                  </div>

                  {/* Teimosinha */}
                  <div>
                    <div className="flex items-center">
                      <input
                        id="teimosinha"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isTeimosinha}
                        onChange={(e) => setIsTeimosinha(e.target.checked)}
                      />
                      <label htmlFor="teimosinha" className="ml-2 block text-sm font-medium text-gray-700">
                        Teimosinha
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Repete o mesmo jogo por múltiplos concursos
                    </p>
                  </div>

                  {/* Quantidade de Teimosinha */}
                  {isTeimosinha && (
                    <div>
                      <label htmlFor="teimosinhaCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantas vezes repetir?
                      </label>
                      <select
                        id="teimosinhaCount"
                        className="input"
                        value={teimosinhaCount}
                        onChange={(e) => setTeimosinhaCount(e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeBetModal}
                      className="button-outline w-1/2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="button-primary w-1/2 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Registrando...</span>
                        </>
                      ) : (
                        <>
                          <Ticket size={18} className="mr-2" />
                          <span>Registrar Aposta</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Aposta em Grupo */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl my-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="mr-2" size={20} />
                  Criar Aposta em Grupo
                </h3>
                <button 
                  onClick={closeGroupBetModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {successMessage ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4 flex items-start">
                  <CheckSquare className="mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-medium">{successMessage}</p>
                    <p className="text-sm mt-1">Você pode criar outra aposta ou fechar esta janela.</p>
                    <div className="mt-4 flex space-x-4">
                      <button 
                        onClick={() => {
                          setSuccessMessage(null);
                          setContestNumber('');
                          setGameNumbers('');
                          setGroupName('');
                          setParticipants([]);
                        }}
                        className="button-outline text-sm py-1"
                      >
                        <Plus size={16} className="mr-1" />
                        Nova Aposta em Grupo
                      </button>
                      <button 
                        onClick={closeGroupBetModal}
                        className="button-primary text-sm py-1"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGroupBetSubmit} className="space-y-4">
                  {/* Nome do Grupo */}
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Grupo
                    </label>
                    <input
                      id="groupName"
                      type="text"
                      className="input"
                      placeholder="Ex: Amigos do Escritório"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Informações do Jogo - Igual ao formulário simples */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de Concurso */}
                    <div>
                      <label htmlFor="gameSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        Concurso/Loteria
                      </label>
                      <select
                        id="gameSelect"
                        className="input"
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        required
                      >
                        {games.length === 0 && (
                          <option value="">Carregando...</option>
                        )}
                        {games.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Número do Concurso */}
                    <div>
                      <label htmlFor="contestNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número do Concurso
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
                    </div>
                  </div>

                  {/* Números do Jogo */}
                  <div>
                    <label htmlFor="gameNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                      Números do Jogo
                    </label>
                    <input
                      id="gameNumbers"
                      type="text"
                      className="input"
                      placeholder="Ex: 01,05,12,24,37,45"
                      value={gameNumbers}
                      onChange={(e) => setGameNumbers(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite os números separados por vírgula
                    </p>
                  </div>

                  {/* Teimosinha */}
                  <div className="flex items-center">
                    <input
                      id="teimosinhaGroup"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={isTeimosinha}
                      onChange={(e) => setIsTeimosinha(e.target.checked)}
                    />
                    <label htmlFor="teimosinhaGroup" className="ml-2 block text-sm font-medium text-gray-700">
                      Teimosinha
                    </label>
                    
                    {isTeimosinha && (
                      <select
                        id="teimosinhaCount"
                        className="ml-4 w-20 input py-1"
                        value={teimosinhaCount}
                        onChange={(e) => setTeimosinhaCount(e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}x
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Área de Participantes */}
                  <div className="border-t border-b border-gray-200 py-4 my-4">
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                      <Users size={18} className="mr-2" />
                      Participantes do Grupo
                    </h4>
                    
                    {/* Formulário para adicionar participante */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          className="input"
                          placeholder="Nome"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="email"
                          className="input"
                          placeholder="Email"
                          value={newParticipantEmail}
                          onChange={(e) => setNewParticipantEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={addParticipant}
                          className="button-outline w-full"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 text-red-800 p-2 rounded-md mb-3 text-sm flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        {error}
                      </div>
                    )}
                    
                    {/* Lista de participantes */}
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nome
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ação
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-3 py-3 text-sm text-gray-500 text-center">
                                Nenhum participante adicionado
                              </td>
                            </tr>
                          ) : (
                            participants.map((participant) => (
                              <tr key={participant.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {participant.name}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {participant.email}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    type="button"
                                    onClick={() => removeParticipant(participant.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {participants.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {participants.length} participante{participants.length !== 1 ? 's' : ''} adicionado{participants.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeGroupBetModal}
                      className="button-outline w-1/2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="button-primary w-1/2 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Registrando...</span>
                        </>
                      ) : (
                        <>
                          <Users size={18} className="mr-2" />
                          <span>Registrar Aposta em Grupo</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;