// Firebase configuration for Copse Platform
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Copse Platform Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAooIhlPlnvEGvNIeVZ6w-LsCC4IwrvIb0",
  authDomain: "copse-platform.firebaseapp.com",
  projectId: "copse-platform",
  storageBucket: "copse-platform.firebasestorage.app",
  messagingSenderId: "635119043695",
  appId: "1:635119043695:web:524a7dd64277055e22b99a",
  measurementId: "G-D667D9124G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
