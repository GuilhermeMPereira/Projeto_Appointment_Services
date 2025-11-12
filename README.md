# Appointment Services 🛠️📅

**Projeto_Appointment Services (APS)** — um protótipo híbrido (mobile + web) para agendamento de serviços entre pessoas físicas e prestadores (eletricistas, encanadores, marceneiros, etc).  
Este repositório contém a versão em desenvolvimento que integra autenticação via Google (OAuth) e leitura básica de eventos do Google Calendar. O armazenamento persistente será feito com Firebase (modelo disponível).

---

## ✨ Visão rápida
Appointment Services é uma base para uma plataforma que:
- Permite prestadores gerirem sua agenda;
- Permite clientes agendarem serviços;
- Sincroniza agendamentos com Google Calendar;
- Mantém um backend leve (Firebase / Firestore) para histórico e regras;

Estado: **WIP — protótipo funcional de login + leitura de eventos**.

---

## 🔍 O que já existe (estado atual)
- Navegação entre telas: Welcome → Login → Calendar.  
- Login com Google via `expo-auth-session` (OAuth).  
- Tela de listagem de eventos do Google Calendar (consome `services/api.js`).  
- Estrutura inicial de telas e assets para mobile/web (Expo).

---

## 🗂️ Estrutura do repositório (atual)
/
├─ App.js
├─ app.json
├─ index.js
├─ package.json
├─ package-lock.json
├─ readme.md
├─ assets/ # imagens, logos (.png)
└─ src/
├─ screens/
│ ├─ WelcomeScreen.js
│ ├─ LoginScreen.js
│ └─ CalendarScreen.js
└─ services/
  └─ api.js # integração com Google Calendar (axios)

---

## 🧰 Tech stack
- **Frontend:** React Native (Expo) — mobile & web  
- **Navegação:** React Navigation (Native Stack)  
- **Autenticação:** expo-auth-session (Google OAuth)  
- **HTTP:** axios  
- **Persistência (modelo):** Firebase / Firestore
- **API externa:** Google Calendar API v3

---

## 🚀 Como apresentar / rodar rapidamente
> Nota: instruções mínimas para demonstrar o protótipo em aula.

1. `git clone <repo>`  
2. `npm install` ou `yarn`  
3. `npx expo start` (ou `yarn start`)  
4. Abrir no Expo Go (dispositivo) ou rodar em web pelo próprio Expo.

Ao usar o fluxo de login, o app tenta autenticar com Google e, em caso de sucesso, exibe os eventos do calendário do usuário na tela `Calendar`.

---

## ⚙️ Arquivo de exemplo de variáveis (modelo)
> Não comitar segredos. Exemplo de `.env.example`:
GOOGLE_CLIENT_ID=seu_client_id_google.apps.googleusercontent.com
FIREBASE_API_KEY=xxxxx
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_APP_ID=1:xxxx:web:yyyy

---

## 🎯 Objetivo do esboço
- Apresentar o que o projeto faz hoje e para onde ele vai;  
- Ser simples e objetivo para a banca/professor;  
- Ter informações úteis para quem quiser abrir o projeto e testar o protótipo.

---

## 📌 Boas observações técnicas
- O token de acesso do Google é passado para a tela `Calendar` e usado para consultar `/calendars/primary/events`.  
- Eventos `all-day` podem usar `start.date` (sem hora); o protótipo já trata `start.dateTime` na listagem, mas é bom mencionar esse detalhe.  
- O `clientId` atual está no código para facilitar demo — mover para `.env` antes de entregar/impor segurança.

---

## 📈 Roadmap
- Integração completa de criação/edição/exclusão de eventos no Google Calendar;  
- Persistência e regras com Firebase (Firestore) — modelo pronto;  
- Sincronização bidirecional (webhooks / Cloud Functions);  
- Interface de prestador: aceitar/recusar solicitações, status de atendimento;  
- Notificações push e agendamento inteligente (detecção de conflitos).

---

## 🤝 Como contribuir
- Abra uma issue descrevendo o que quer implementar.  
- Crie um branch `feat/<descrição>` ou `fix/<descrição>`.  
- Faça PR com screenshots e passos de teste.

---

## 📝 Licença
A definir

---

## ✨ Mensagem final
Appointment Services é um protótipo pensado para apresentar a ideia central com fluxo de autenticação e visualização de agenda. O objetivo deste README é comunicar claramente o que existe hoje, o valor do projeto e a visão futura — tudo num formato limpo e pronto para apresentação.