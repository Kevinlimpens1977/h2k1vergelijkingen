import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCHS7CM5VfCYFUU-Ellb7FnuM2qNcqUn_c",
    authDomain: "h8-vergelijkingen-digibordapp.firebaseapp.com",
    projectId: "h8-vergelijkingen-digibordapp",
    storageBucket: "h8-vergelijkingen-digibordapp.firebasestorage.app",
    messagingSenderId: "382373537264",
    appId: "1:382373537264:web:977f0840963120dc15e935",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Sanity check: returns true if Firebase app initialized successfully. */
export function isFirebaseReady(): boolean {
    return !!app.name;
}
