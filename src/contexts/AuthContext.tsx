import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// URL da API - Alterar para a URL real quando em produção
const API_URL = 'http://localhost:3000/api';

// Definir tipos
interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  profile?: {
    nome?: string;
    createdAt?: string;
    lastUpdated?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<boolean>;
}

// Criar contexto
export const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Configurar interceptor global do axios
  useEffect(() => {
    // Adicionar interceptor para tratar erros de autenticação
    const interceptor = axios.interceptors.response.use(
      (response) => response, 
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Se receber um 401, tentar atualizar o token
          console.log('Erro 401 interceptado, tentando atualizar token...');
          const refreshSuccess = await refreshToken();
          
          if (refreshSuccess && error.config) {
            // Tentar novamente a requisição original com o novo token
            return axios(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Limpar interceptor quando componente desmontar
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Atualizar token de autenticação para requisições futuras
  const updateAuthToken = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken(true); // Force refresh token
      localStorage.setItem('authToken', token);
      
      // Configurar o axios para usar o token em todas as requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Token atualizado e configurado nas requisições');
      return token;
    } catch (err) {
      console.error('Erro ao obter token:', err);
      return null;
    }
  };

  // Função para atualizar o token acessível pelo contexto
  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('Não há usuário autenticado para atualizar o token');
        return false;
      }
      
      const token = await updateAuthToken(currentUser);
      return !!token;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      return false;
    }
  };

  // Monitorar mudanças no estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuário está autenticado
          console.log('Firebase Auth: usuário autenticado', firebaseUser.uid);
          
          // Atualizar token
          await updateAuthToken(firebaseUser);
          
          // Buscar perfil do usuário da API
          try {
            const response = await axios.get(`${API_URL}/users/profile`);
            if (response.data.success) {
              // Atualizar dados do usuário com os dados do perfil
              const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                emailVerified: firebaseUser.emailVerified,
                profile: response.data.profile
              };
              
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
              setIsAuthenticated(true);
            }
          } catch (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            // Mesmo sem perfil, ainda consideramos o usuário autenticado
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              emailVerified: firebaseUser.emailVerified
            });
            setIsAuthenticated(true);
          }
        } else {
          // Usuário não está autenticado
          console.log('Firebase Auth: usuário não autenticado');
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Erro no listener de autenticação:', error);
      } finally {
        setLoading(false);
      }
    });

    // Limpar o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Login diretamente pelo Firebase
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Tentando fazer login via Firebase:', email);
      
      // Login via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Login Firebase bem-sucedido:', firebaseUser.uid);
      
      // Atualizar token
      await updateAuthToken(firebaseUser);
      
      // O onAuthStateChanged acima irá cuidar de atualizar o estado
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no Firebase login:', error);
      
      // Traduzir mensagens de erro do Firebase
      let message = 'Erro ao realizar login';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'E-mail ou senha incorretos';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas de login. Tente novamente mais tarde';
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Registro via Firebase
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Registro bem-sucedido:', firebaseUser.uid);
      
      // Obter token
      await updateAuthToken(firebaseUser);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Traduzir mensagens de erro do Firebase
      let message = 'Erro ao realizar cadastro';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está sendo utilizado';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        message = 'E-mail inválido';
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged acima irá cuidar de limpar os dados
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 