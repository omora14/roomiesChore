import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
// These are loaded from .env file (EXPO_PUBLIC_ prefix required for Expo)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(
    'Missing Firebase configuration. Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set.'
  );
}

// Initialize Firebase app (prevent duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log(`Firebase initialized successfully - Project: ${firebaseConfig.projectId}`);
} else {
  app = getApps()[0];
  console.log('Firebase app already initialized, using existing instance');
}

// Initialize Auth
const auth = getAuth(app);

export { auth };
export default app;
