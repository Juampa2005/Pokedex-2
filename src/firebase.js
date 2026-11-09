// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC8o2EnNfyRimlUi5Nsh3jU5BC3SA7sx4E",
    authDomain: "pokedex-926c2.firebaseapp.com",
    projectId: "pokedex-926c2",
    storageBucket: "pokedex-926c2.firebasestorage.app",
    messagingSenderId: "732811519309",
    appId: "1:732811519309:web:a554231b2336e5a3174304",
    measurementId: "G-57KFYKZWW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar y exportar Firestore
export const db = getFirestore(app)

export const auth = getAuth(app)