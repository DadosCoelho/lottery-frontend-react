import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AtSign, Eye, EyeOff, Key, UserPlus, AlertCircle, Clover } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não correspondem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await register(email, password, {
        role: 'common',
        is_premium: false
      });

      if (result.success) {
        // Login automático após registro
        const loginResult = await login(email, password);
        if (loginResult.success) {
          navigate('/dashboard'); // ou a rota que desejar
        } else {
          setError('Cadastro realizado, mas houve erro ao fazer login automático.');
          navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' } });
        }
      } else {
        setError(result.message || 'Erro ao realizar cadastro');
      }
    } catch (error: any) {
      setError('Erro ao realizar cadastro. Tente novamente.');
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-blue-50 to-primary-50 px-2">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* Banner lateral */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex md:flex flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-blue-500 md:w-1/2 w-full md:p-10 p-6 text-white md:rounded-none rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
        >
          <Clover size={56} className="mb-4 drop-shadow-lg" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Bem-vindo ao Conf-Loto</h2>
          <p className="text-base md:text-lg mb-4 md:mb-6 text-blue-100 text-center">
            Crie sua conta para acessar resultados, estatísticas e gerenciar suas apostas.
          </p>
          <div className="mt-4 md:mt-8 text-sm text-blue-100/80 text-center">
            <span>Já tem conta?</span>
            <Link
              to="/login"
              className="ml-2 underline font-semibold text-white hover:text-yellow-200"
            >
              Entrar
            </Link>
          </div>
        </motion.div>
        {/* Card de registro */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white"
        >
          <div className="flex flex-col items-center mb-6">
            <Clover size={36} className="text-primary-600 mb-2" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Crie sua conta</h2>
            <p className="text-gray-500 text-xs md:text-sm text-center">Preencha os campos abaixo para se registrar</p>
          </div>
          <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            <div>
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
            <div>
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
                  autoComplete="new-password"
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
                    tabIndex={-1}
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
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirme a Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="input pl-10"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {/* Botão de registro */}
            <div>
              <button
                type="submit"
                className="button-primary w-full flex justify-center items-center text-base md:text-lg py-3"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
            {/* Link para login mobile */}
            <div className="text-center mt-4 md:hidden">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;