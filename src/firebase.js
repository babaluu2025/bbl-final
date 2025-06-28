// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtmDU5nuhq8qggBZSQ_GVW1c3rnL6H0_8",
  authDomain: "bbl-billing-app.firebaseapp.com",
  projectId: "bbl-billing-app",
  storageBucket: "bbl-billing-app.firebasestorage.app",
  messagingSenderId: "879061229936",
  appId: "1:879061229936:web:e44afe2366b704b3862fb5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
