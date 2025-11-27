# Appointment Services 🛠️📅

[![Expo](https://img.shields.io/badge/Expo-Using-black?style=for-the-badge&logo=expo)]()
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-blue?style=for-the-badge&logo=firebase)]()
[![Status](https://img.shields.io/badge/WIP-Prototype-yellow?style=for-the-badge)]()


**Projeto_Appointment Services (APS)** — um protótipo híbrido (mobile + web) para agendamento de serviços entre pessoas físicas e prestadores (eletricistas, encanadores, marceneiros, etc).  
Esta versão utiliza **Firebase (Auth + Firestore)** como backend principal para autenticação e armazenamento de agendamentos. A arquitetura do projeto também está preparada para evoluir com integrações de sincronização de agendas (por exemplo, Google Calendar).

---

## ✨ Visão rápida
Appointment Services é a base de uma plataforma que:
- Permite prestadores gerirem sua agenda e responder pedidos;
- Permite clientes encontrarem prestadores e solicitarem agendamentos;
- Realiza verificação de disponibilidade por data/hora;
- Armazena histórico e estado dos agendamentos;

Estado: **WIP — protótipo funcional com autenticação e agendamento**.

---

## 🔍 O que já existe (estado atual)
- Roteamento condicional por tipo de usuário (`usuarios/{uid}.tipo`) — direciona para área do **Cliente** ou do **Prestador**.  
- Tela do Cliente (`src/screens/index_cliente.js`) com:
  - Busca por prestadores (filtro por nome/serviço);
  - Modal de agendamento (fluxo: escolher serviço → escolher data → escolher horário);
  - Verificação de horários livres consultando a coleção `agendamentos` no Firestore;
  - Criação de agendamento com campos `clienteId`, `prestadorId`, `dataString`, `horaString`, `status`, etc.;
  - Visualização de reservas em tempo real (`onSnapshot`).  
- Tela do Prestador (`src/screens/index_prestador.js`) (estrutura para gerenciar pedidos e alterar status).  
- Integração e inicialização do Firebase em `src/firebase/firebase.js` (Auth + Firestore).  
- Arquitetura pronta para incorporar integrações externas (ex.: utilitário para Google Calendar em `src/services/api.js`).  
- Estilos organizados em `src/styles/*` e assets de UI em `assets/`.

---

## 🗂️ Estrutura do repositório (atual)

- **APPOINTMENT_SERVICES/**
  - `App.js`
  - `app.json`
  - `index.js`
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - **assets/** — imagens e ícones (`.png`, `.jpg`)
  - **src/**
    - **firebase/**
      - `firebase.js` — configuração e inicialização do Firebase (Auth + Firestore)
    - **screens/**
      - `index_cliente.js`
      - `index_prestador.js`
      - `login.js`
      - `registro.js`
      - `perfil_cliente.js`
      - `WelcomeScreen.js`
    - **services/**
      - `api.js` — utilitário para integração com Google Calendar
    - **styles/**
      - `ClienteScreenStyles.js`
      - `LoginScreenStyles.js`
      - `prestadorStyles.js`
      - `ProfileStyles.js`
      - `RegisterScreenStyles.js`
      - `WelcomeScreenStyles.js`

---

## 🧰 Tech stack
- **Frontend:** React Native (Expo) — mobile & web  
- **Navegação:** React Navigation (Native Stack)  
- **Autenticação / DB:** Firebase Authentication & Firestore (ponto central do backend atual)  
- **Date Picker / Calendar:** react-native-calendars  
- **HTTP:** axios (disponível em `src/services/api.js` para integrações externas)  
- **Outros:** bibliotecas e utilitários padrão do Expo (imagem, modal, etc.)

---

## 🚀 Como apresentar / rodar rapidamente
> Instruções mínimas para demonstrar o protótipo em aula.

1. `git clone <repo>`  
2. `npm install` ou `yarn`  
3. `npx expo start` (ou `yarn start`)  
4. Abrir no Expo Go (dispositivo) ou rodar em web pelo próprio Expo.

Fluxo para demo:
- Crie/entre com uma conta no app (registro/login);  
- Caso o documento em `usuarios/{uid}` tenha `tipo: "prestador"` você verá o painel do prestador; caso contrário, verá o painel do cliente;  
- No painel do cliente, pesquise prestadores, abra o modal de serviço e solicite um agendamento;  
- Verifique a coleção `agendamentos` no console do Firebase para inspecionar os documentos criados (útil para a banca).

---

## ⚙️ Arquivo de exemplo de variáveis (modelo)
> Não comitar segredos. Exemplo de `.env.example`:
FIREBASE_API_KEY=xxxxx
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=xxxxx
FIREBASE_APP_ID=1:xxxx:web:yyyy
> Observação: o repositório já contém `src/firebase/firebase.js` com configuração preenchida para facilitar a demo local. Antes de publicar publicamente, mova essas credenciais para variáveis de ambiente.

---

## 🎯 Objetivo do esboço
- Comunicar de forma clara o que o protótipo faz hoje e qual a direção prevista;  
- Ser simples e objetivo para a banca/professor;  
- Conter orientações suficientes para quem for executar o projeto localmente.

---

## 📌 Boas observações técnicas
- Agendamentos são documentos em Firestore com campos relevantes: `clienteId`, `prestadorId`, `dataAgendamento` (Date), `dataString`, `horaString`, `servicoNome`, `servicoPreco`, `status` (`pendente` / `confirmado` / `recusado`).  
- Para checar disponibilidade, o app consulta `agendamentos` por `prestadorId` + `dataString` e filtra horários já ocupados.  
- O fluxo de autenticação e autorização é tratado pelo Firebase Auth; recomenda-se validar regras do Firestore para garantir que apenas usuários autorizados leiam/escrevam documentos apropriados.  
- A arquitetura contempla sincronização com agendas externas (ex.: Google Calendar) como evolução natural — há um utilitário (`src/services/api.js`) pensado para isso.

---

## 📈 Roadmap
- Integração com sistemas de calendário (sincronização / notificações)  
- Interface completa do prestador (aceitar/recusar, filtros por data, calendário mensal)  
- Regras robustas no Firestore e validações de dados (security rules)  
- Notificações push e lembretes automáticos  
- Painel administrativo e métricas para prestadores (taxas, tempo médio de atendimento)  
- Polimento de UX e adaptação para produção (variáveis de ambiente, build pipeline)

---

## 🤝 Como contribuir
- Abra uma issue descrevendo a mudança/feature.  
- Crie um branch `feat/<descrição>` ou `fix/<descrição>`.  
- Faça PR com descrição do que foi alterado e passos para testar.

---

## 📝 Licença
A definir

---

## ✨ Mensagem final
Appointment Services é um protótipo acadêmico com bases técnicas sólidas para ser escalado para um produto real. A versão atual foca em autenticação, fluxo cliente/prestador e persistência de agendamentos via Firebase — um ponto de partida claro para continuação e aprimoramento.