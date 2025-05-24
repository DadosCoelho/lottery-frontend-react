import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9ctbfwGXHCm7uLoKNER_WJITYaLMmo9I",
  authDomain: "conf-loto.firebaseapp.com",
  databaseURL: "https://conf-loto-default-rtdb.firebaseio.com",
  projectId: "conf-loto",
  storageBucket: "conf-loto.firebasestorage.app",
  messagingSenderId: "762971944104",
  appId: "1:762971944104:web:7ae1d52762737e153fbe9d",
  measurementId: "G-VQYHP7BSE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Verificar se a inicialização foi bem-sucedida
console.log('Firebase inicializado com sucesso:', app.name);
console.log('Auth inicializado:', !!auth);
console.log('Database inicializado:', !!database);

export { app, auth, database }; 