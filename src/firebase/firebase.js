import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cole suas chaves aqui (pegue no Console do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBcysEjZlvN5FZg0easvJoHOYbNbp7D2x0",
  authDomain: "appointmentservices-58258.firebaseapp.com",
  projectId: "appointmentservices-58258",
  storageBucket: "appointmentservices-58258.firebasestorage.app",
  messagingSenderId: "1006396462830",
  appId: "1:1006396462830:web:04ea0a1a8a5e891ac6c5ff",
  measurementId: "G-9K0NH2BG2J"
};

// Inicializa o app do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta a Autenticação e o Banco de Dados
// Isso permite que você use 'auth' e 'db' em outros arquivos (como no registro e login)
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };