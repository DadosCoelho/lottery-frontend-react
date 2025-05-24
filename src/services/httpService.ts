import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL
const API_URL = 'http://localhost:3000/api';

// Configurações padrão
const DEFAULT_TIMEOUT = 10000; // 10 segundos
const MAX_RETRIES = 2;

/**
 * Classe para centralizar requisições HTTP
 */
class HttpService {
  private retryCount: Record<string, number> = {};

  // Configurar o serviço
  constructor() {
    this.setupDefaults();
    this.setupInterceptors();
  }

  // Configurar valores padrão do axios
  private setupDefaults() {
    axios.defaults.timeout = DEFAULT_TIMEOUT;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  // Configurar interceptors
  private setupInterceptors() {
    // Interceptor de requisições
    axios.interceptors.request.use(
      (config) => {
        // Recuperar token do localStorage se disponível
        const token = localStorage.getItem('authToken');
        
        // Adicionar token à requisição se existir
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`Enviando requisição para: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Erro na requisição HTTP:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de respostas para logar erros
    axios.interceptors.response.use(
      (response) => {
        console.log(`Resposta bem-sucedida de: ${response.config.url}`);
        // Resetar contador de retry para esta URL
        if (response.config.url) {
          this.retryCount[response.config.url] = 0;
        }
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config;
        
        if (config && config.url) {
          // Inicializar contador se não existir
          if (this.retryCount[config.url] === undefined) {
            this.retryCount[config.url] = 0;
          }
          
          // Verificar se devemos tentar novamente
          if (this.retryCount[config.url] < MAX_RETRIES && (error.code === 'ECONNABORTED' || !error.response)) {
            this.retryCount[config.url]++;
            console.log(`Tentando novamente (${this.retryCount[config.url]}/${MAX_RETRIES}): ${config.url}`);
            
            // Atraso exponencial antes de tentar novamente
            const delay = Math.pow(2, this.retryCount[config.url]) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return axios(config);
          }
          
          // Resetar contador após exceder max retries
          this.retryCount[config.url] = 0;
        }
        
        if (error.response) {
          // O servidor respondeu com um status de erro
          console.error(
            `Erro ${error.response.status} na requisição:`,
            error.response.data
          );
        } else if (error.request) {
          // A requisição foi feita mas não houve resposta
          console.error('Sem resposta do servidor:', error.request);
        } else {
          // Algo aconteceu durante a configuração da requisição
          console.error('Erro de configuração da requisição:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // GET Request
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.get<T>(`${API_URL}${endpoint}`, config);
  }

  // POST Request
  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.post<T>(`${API_URL}${endpoint}`, data, config);
  }

  // PUT Request
  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.put<T>(`${API_URL}${endpoint}`, data, config);
  }

  // DELETE Request
  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.delete<T>(`${API_URL}${endpoint}`, config);
  }

  // PATCH Request
  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.patch<T>(`${API_URL}${endpoint}`, data, config);
  }
}

// Exportar instância única do serviço HTTP
export const httpService = new HttpService();

export default httpService; 