import { firebase } from './firebase';

export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Usar token passado explicitamente ou buscar do localStorage
    const authToken = token || localStorage.getItem('auth_token');
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
        method,
        headers,
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        console.log(`Fazendo requisição para ${API_BASE_URL}${endpoint}`, { method, data });
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Tentar obter JSON da resposta
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            result = { message: text };
        }
        
        if (!response.ok) {
            console.error(`Erro na requisição para ${endpoint}:`, result);
            throw new Error(result.error || 'Erro na requisição');
        }
        
        return result;
    } catch (err) {
        console.error(`Erro ao chamar API (${endpoint}):`, err);
        
        // Verificar se é um erro de conexão
        if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
            throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
        }
        
        throw err;
    }
}

// Função para trocar custom token por ID token
async function exchangeCustomTokenForIdToken(customToken) {
    try {
        console.log('Trocando custom token por ID token');
        const userCredential = await firebase.auth().signInWithCustomToken(customToken);
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        
        console.log('ID token obtido com sucesso');
        return idToken;
    } catch (error) {
        console.error('Erro ao trocar token:', error);
        return null;
    }
}

// Funções específicas de autenticação
export const authService = {
    // Login de usuário
    async login(email, password) {
        try {
            console.log('Tentando login com:', email);
            const response = await apiRequest('/auth/login', 'POST', { email, password });
            
            console.log('Login bem-sucedido:', response);
            if (response.token) {
                // Trocar o token customizado por um ID token
                const idToken = await exchangeCustomTokenForIdToken(response.token);
                
                // Armazenar o token (ID token se disponível, ou o customizado como fallback)
                const tokenToStore = idToken || response.token;
                localStorage.setItem('auth_token', tokenToStore);
                console.log('Token salvo no localStorage:', tokenToStore.substring(0, 20) + '...');
            }
            
            return response;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },
    
    // Registro de usuário
    async register(name, email, password) {
        try {
            console.log('Registrando usuário:', email);
            const response = await apiRequest('/auth/register', 'POST', { name, email, password });
            
            console.log('Registro bem-sucedido:', response);
            if (response.token) {
                // Trocar o token customizado por um ID token
                const idToken = await exchangeCustomTokenForIdToken(response.token);
                
                // Armazenar o token (ID token se disponível, ou o customizado como fallback)
                const tokenToStore = idToken || response.token;
                localStorage.setItem('auth_token', tokenToStore);
                console.log('Token salvo no localStorage:', tokenToStore.substring(0, 20) + '...');
            }
            
            return response;
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    },
    
    // Verificar autenticação atual
    async getCurrentUser() {
        try {
            console.log('Verificando usuário atual');
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
                throw new Error('Não há token de autenticação');
            }
            
            console.log('Token encontrado:', token.substring(0, 20) + '...');
            return await apiRequest('/auth/me', 'GET');
        } catch (error) {
            console.error('Erro ao verificar usuário atual:', error);
            throw error;
        }
    },
    
    // Logout
    logout() {
        console.log('Realizando logout');
        localStorage.removeItem('auth_token');
        
        // Também fazer logout do Firebase
        firebase.auth().signOut().catch(error => {
            console.error('Erro ao fazer logout do Firebase:', error);
        });
    }
};