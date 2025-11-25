// Importa as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // Importante para o Login/Registro
import { getFirestore } from "firebase/firestore"; // Importante para salvar os dados

// Suas credenciais do Firebase (Copiadas do seu código)
const firebaseConfig = {
  apiKey: "AIzaSyB5FTiAIWs2EdrflD_W41aL4QD6ckfgCvc",
  authDomain: "appointmentservices-8ab53.firebaseapp.com",
  projectId: "appointmentservices-8ab53",
  storageBucket: "appointmentservices-8ab53.firebasestorage.app",
  messagingSenderId: "898636099226",
  appId: "1:898636099226:web:4b25ae49c6c4f36f4a3923",
  measurementId: "G-6TE6NH2F35"
};

// 1. Inicializa o app
const app = initializeApp(firebaseConfig);

// 2. Inicializa e EXPORTA a Autenticação (Isso corrige o erro anterior)
export const auth = getAuth(app);

// 3. Inicializa e EXPORTA o Banco de Dados (Para salvar usuário e prestador)
export const db = getFirestore(app);

// (O Analytics é opcional agora, se quiser ativar depois, descomente a linha abaixo)
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);