// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "AIzaSyB2WYlxGnh5xPvv7TMaYfl3DC0s3oIfzdY",
  authDomain: "boba-cafe-4ef7b.firebaseapp.com",
  projectId: "boba-cafe-4ef7b",
  storageBucket: "boba-cafe-4ef7b.firebasestorage.app",
  messagingSenderId: "66931317230",
  appId: "1:66931317230:web:590605b32b6c78639a96ff",
  measurementId: "G-2YT7MHJ8BJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// Connect to Firestore emulator in development
if (process.env.NODE_ENV === 'development' && !window.location.hostname.includes('vercel.app')) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}

export default app;
