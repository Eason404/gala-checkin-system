import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gala-checkin-system.firebaseapp.com",
  projectId: "gala-checkin-system",
  storageBucket: "gala-checkin-system.firebasestorage.app",
  messagingSenderId: "433574027826",
  appId: "1:433574027826:web:28b85ad7d3bf130b1d122b",
  measurementId: "G-02D5SPKPJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();