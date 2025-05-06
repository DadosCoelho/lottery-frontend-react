import firebase from 'firebase/app';
import 'firebase/auth';

console.log('Carregando Firebase SDK...');
console.log('Firebase SDK disponível:', typeof firebase);

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

try {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK não foi carregado corretamente.');
    }
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado com sucesso');
} catch (err) {
    console.error('Erro ao inicializar Firebase:', err);
    document.getElementById('root').innerHTML = `<p style="color: red; text-align: center;">Erro: Falha ao inicializar Firebase. Detalhes: ${err.message}</p>`;
    throw err;
}

export { firebase };