import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AtSign, Eye, EyeOff, Key, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null); // Para debug
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuário já autenticado, redirecionando...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Verificar se há uma mensagem de sucesso do registro
  useEffect(() => {
    if (location.state?.message) {
      setDebugInfo(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentando fazer login com:', email);
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Enviando requisição de login...');
      
      const result = await login(email, password);
      setDebugInfo(`Resultado do login: ${JSON.stringify(result)}`);
      
      if (result.success) {
        // Redirecionar para a página principal ou página de origem
        setDebugInfo('Login bem-sucedido, redirecionando...');
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      } else {
        setDebugInfo(`Erro no login: ${result.message}`);
        setError(result.message || 'Erro ao realizar login');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      setDebugInfo(`Erro capturado: ${error.message || 'Erro desconhecido'}`);
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar informações de debug na parte inferior da página
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'production' && debugInfo) {
      return (
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
          <p className="font-bold mb-2">Informações de debug:</p>
          <p className="whitespace-pre-wrap">{debugInfo}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesso ao Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre com suas credenciais para acessar
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Campo de e-mail */}
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input pl-10"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Campo de senha */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão de login */}
          <div>
            <button
              type="submit"
              className="button-primary w-full flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
          
          {/* Link para registro */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Registrar-se
              </Link>
            </p>
          </div>
          
          {/* Informações de debug */}
          {renderDebugInfo()}
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage; 