import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCuhmK_44h6NRgibFbxMl_0dlfy3Q07Gl8",
  authDomain: "ki-duell.firebaseapp.com",
  projectId: "ki-duell",
  storageBucket: "ki-duell.firebasestorage.app",
  messagingSenderId: "331362011602",
  appId: "1:331362011602:web:1d2597e1b15d14e051600b",
  measurementId: "G-RDDTGQ149N"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const googleProvider = new GoogleAuthProvider();
