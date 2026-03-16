import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_TRADERS_MARKET_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

let performance: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== 'undefined') {
  // Initialize Performance Monitoring
  performance = getPerformance(app);
}

export { performance };
export default app;
