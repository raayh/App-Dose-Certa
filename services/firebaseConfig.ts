import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Aqui nós "puxamos" as chaves do seu arquivo secreto
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos os serviços específicos usando o app que já criamos
export const auth = getAuth(app); // 
export const db = getFirestore(app);

/* 
Lembre-se: 
* o `export` precisa de um nome, de uma "caixa" onde o resultado daquela ação está guardado;
* `const auth = ...` é a criação da caixa (variável). 
* `getAuth(app)` é uma ação (uma função sendo executada);

Se você chamasse getAuth(app) direto em todas as telas sem guardar numa constante, o Firebase teria que "se inicializar" 
toda vez que você mudasse de tela. Isso gastaria memória, bateria do celular e poderia gerar bugs de usuário deslogando 
sozinho. 
Com o const, nós criamos o objeto uma única vez e apenas o compartilhamos com o resto do app.
*/