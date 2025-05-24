### **`lottery-frontend-react/README.md` (Novo)**


# Lottery Online - Resultados em Tempo Real (Frontend)

Este é o projeto frontend da aplicação "Lottery Online", desenvolvido com React, TypeScript e Vite. Ele oferece uma interface de usuário moderna e responsiva para que os usuários possam consultar resultados de loterias, gerenciar suas apostas e visualizar estatísticas detalhadas. A aplicação se integra com um backend Node.js (separado) e utiliza o Firebase para autenticação e persistência de dados.

## Funcionalidades

*   **Dashboard Personalizada:** Uma tela inicial para usuários autenticados, exibindo informações de perfil e atalhos para as principais funcionalidades.
*   **Autenticação de Usuários:** Telas de login e registro completas, integradas com o Firebase Authentication para um gerenciamento seguro de usuários.
*   **Rotas Protegidas:** Implementação de rotas que exigem autenticação, garantindo que apenas usuários logados possam acessar certas partes da aplicação.
*   **Consulta de Resultados de Loterias:**
    *   Visualização dos últimos resultados de diversas loterias populares (Mega-Sena, Quina, Lotofácil, Lotomania, Timemania, Dupla Sena, etc.).
    *   Funcionalidade de busca para encontrar resultados de concursos específicos por número ou data.
    *   Páginas de detalhes para cada sorteio, apresentando números sorteados, informações de premiação e dados do próximo concurso.
*   **Minhas Apostas:**
    *   Recurso para registrar e acompanhar apostas individuais e em grupo.
    *   Verificação automática do status das apostas com base nos resultados dos sorteios oficiais.
    *   Ferramentas de filtro e estatísticas para uma gestão eficiente das apostas do usuário.
*   **Estatísticas de Números:** Análise aprofundada da frequência de números sorteados (identificando números "quentes" e "frios") para auxiliar os usuários em suas escolhas de aposta.
*   **Design Responsivo:** A interface é totalmente adaptável, proporcionando uma experiência de usuário consistente em diferentes dispositivos (desktops, tablets e smartphones).
*   **Animações Suaves:** Utiliza a biblioteca Framer Motion para transições e animações fluidas, melhorando a experiência visual.

## Tecnologias Utilizadas

*   **React:** Biblioteca JavaScript líder para construção de interfaces de usuário interativas.
*   **TypeScript:** Superset de JavaScript que adiciona tipagem estática, melhorando a robustez e a manutenibilidade do código.
*   **Vite:** Uma ferramenta de build de próxima geração que oferece um ambiente de desenvolvimento extremamente rápido.
*   **Tailwind CSS:** Um framework CSS utilitário que permite construir designs personalizados rapidamente, com foco na responsividade.
*   **Firebase (Client SDK):** Utilizado para autenticação de usuários e interação com o Firebase Realtime Database para dados do usuário e apostas.
*   **Framer Motion:** Uma biblioteca poderosa e fácil de usar para animações e gestos em React.
*   **React Router DOM:** Para gerenciar o roteamento declarativo na aplicação, permitindo navegação entre as páginas.
*   **Axios:** Um cliente HTTP baseado em Promises para fazer requisições ao backend.
*   **Date-fns:** Uma biblioteca leve e modular para manipulação e formatação de datas.
*   **Lucide React:** Uma coleção de ícones bonitos e personalizáveis para a interface.

## Instalação

Para configurar e executar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/DadosCoelho/lottery-frontend-react.git
    cd lottery-frontend-react
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```

## Configuração

O frontend se conecta a um backend Node.js (separado) e ao Firebase.

1.  **Firebase Client SDK:**
    A configuração do Firebase Client SDK está localizada em `src/services/firebase.ts`. Certifique-se de que as credenciais (`apiKey`, `authDomain`, `databaseURL`, `projectId`, etc.) estejam corretas para o seu projeto Firebase.

    ```typescript
    // src/services/firebase.ts
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      databaseURL: "SUA_DATABASE_URL",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_MESSAGING_SENDER_ID",
      appId: "SEU_APP_ID",
      measurementId: "SEU_MEASUREMENT_ID"
    };
    ```

2.  **URL do Backend:**
    O serviço HTTP (`src/services/httpService.ts`) está configurado para se comunicar com o backend na URL `http://localhost:3000/api`. Se o seu backend estiver em uma porta ou domínio diferente, você precisará ajustar esta URL.

    ```typescript
    // src/services/httpService.ts
    const API_URL = 'http://localhost:3000/api'; // Ajuste conforme necessário
    ```

3.  **Regras de Segurança do Firebase Realtime Database (`database.rules.json`):**
    O arquivo `database.rules.json` na raiz do projeto (`lottery-frontend-react/database.rules.json`) define as regras de segurança para o Firebase Realtime Database. Estas regras são cruciais para controlar o acesso aos dados de usuários e apostas, garantindo que cada usuário só possa acessar seus próprios dados.

    *   **Exemplo de Regras (para referência):**
        ```json
        {
          "rules": {
            ".read": "auth != null",
            ".write": "auth != null",
            "bets": {
              ".read": "auth != null",
              ".write": "auth != null",
              "$betId": {
                ".read": "auth != null && data.child('userId').val() === auth.uid",
                ".write": "auth != null && (newData.child('userId').val() === auth.uid || !data.exists())"
              }
            },
            "users": {
              "$userId": {
                ".read": "auth != null && auth.uid === $userId",
                ".write": "auth != null && auth.uid === $userId",
                "bets": {
                  ".read": "auth != null && auth.uid === $userId",
                  ".write": "auth != null && auth.uid === $userId"
                }
              }
            }
          }
        }
        ```
        Você deve importar estas regras para o seu projeto Firebase através do console para que elas sejam aplicadas.

## Executando a Aplicação

Você pode executar o frontend e o backend separadamente ou ambos simultaneamente.

### Executando Apenas o Frontend

```
npm run dev
```
Este comando iniciará o servidor de desenvolvimento do Vite na porta padrão (geralmente 5173).

Executando Apenas o Backend (a partir da pasta do frontend)
```
npm run api
```
Este comando é um atalho definido no package.json do frontend para iniciar o backend. Ele assume que o backend está localizado em uma pasta api (ou lottery-backend-node se você o moveu) no mesmo nível do diretório do frontend.

Executando Frontend e Backend Simultaneamente
Para iniciar ambos os servidores com um único comando (requer a dependência concurrently, que já está incluída nas devDependencies):
```
npm run dev:all
```
Este comando iniciará o frontend e o backend em processos separados, mas gerenciados por um único comando.

Estrutura do Projeto
```
lottery-frontend-react/
├── public/             # Arquivos estáticos (ex: favicon, imagens)
├── src/
│   ├── assets/         # Imagens, ícones, etc.
│   ├── components/     # Componentes React reutilizáveis (Header, Footer, NumberBall, etc.)
│   ├── contexts/       # Contextos React para gerenciamento de estado global (AuthContext para autenticação)
│   ├── layouts/        # Layouts da aplicação (MainLayout)
│   ├── pages/          # Páginas principais da aplicação (DashboardPage, LoginPage, MinhasApostasPage, etc.)
│   ├── services/       # Serviços para interação com APIs (api.ts, firebase.ts, httpService.ts)
│   ├── types/          # Definições de tipos TypeScript para a aplicação
│   ├── App.tsx         # Componente principal da aplicação e configuração de roteamento
│   ├── index.css       # Estilos globais e importações do Tailwind CSS
│   └── main.tsx        # Ponto de entrada da aplicação (renderização do React)
├── .gitattributes      # Configurações do Git para normalização de linha
├── .gitignore          # Arquivos e pastas a serem ignorados pelo Git
├── database.rules.json # Regras de segurança do Firebase Realtime Database
├── eslint.config.js    # Configuração do ESLint para linting de código
├── index.html          # Arquivo HTML principal da aplicação
├── package.json        # Dependências e scripts do projeto
├── postcss.config.js   # Configuração do PostCSS (utilizado pelo Tailwind CSS)
├── tailwind.config.js  # Configuração do Tailwind CSS
├── tsconfig.json       # Configurações do TypeScript para o projeto
├── vite.config.ts      # Configuração do Vite para o processo de build
└── README.md           # Este arquivo
```
Scripts Disponíveis
* npm run dev: Inicia o servidor de desenvolvimento do Vite.
* npm run api: Inicia o servidor backend (assumindo que está na pasta api).
* npm run dev:all: Inicia o frontend e o backend simultaneamente usando concurrently.
* npm run build: Compila o projeto para produção.
* npm run lint: Executa o linter (ESLint) para verificar problemas de código.
* npm run preview: Serve a build de produção localmente para visualização.