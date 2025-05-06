# ConfLoto - Frontend

Este é o frontend do sistema ConfLoto, uma aplicação web para gerenciamento de apostas em loterias brasileiras. Ele é construído com React (via CDN), Firebase para autenticação, e se comunica com um backend Flask.

## Estrutura do Projeto
lottery-frontend/
├── index.html              # Arquivo principal (HTML)
├── css/
│   └── styles.css          # Estilos globais
├── js/
│   ├── app.js             # Lógica principal (componente App)
│   ├── components/        # Componentes React
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Profile.js
│   │   ├── BetForm.js
│   ├── services/
│   │   ├── firebase.js    # Configuração do Firebase
│   │   └── api.js         # Funções para chamadas ao backend
├── README.md              # Este arquivo


## Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge).
- Backend rodando em `http://localhost:5000` (veja `lottery-backend`).
- Conexão com a internet para carregar dependências via CDN.

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/lottery-frontend.git
   cd lottery-frontend

Sirva os arquivos estáticos com um servidor HTTP:
bash

Copiar
python -m http.server 8000
Acesse o frontend em http://localhost:8000.
Uso
Login/Registro: Use as páginas de login e registro para autenticar usuários.
Perfil: Visualize e edite o perfil do usuário.
Apostas: Crie apostas individuais na página de apostas.
Desenvolvimento
Depuração: Use o console do navegador (F12) para verificar erros.
Hot Reload: Use live-server para recarregamento automático:
bash

Copiar
npm install -g live-server
live-server .
Próximos Passos
Adicionar componentes para bolões (GroupBetForm.js).
Implementar painel admin (AdminPanel.js).
Integrar consulta de resultados de loterias.
Configurar notificações via Telegram.
Licença
MIT License.

Contato
Email: seu-email@example.com
GitHub: <seu-usuario>