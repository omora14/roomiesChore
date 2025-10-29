import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "", // Add your apiKey here
  authDomain: "roomieschore.firebaseapp.com",
  projectId: "roomieschore",
  storageBucket: "roomieschore.firebasestorage.app",
  messagingSenderId: "124104185421",
  appId: "1:124104185421:web:fde2a790f98d6ec9606e04",
  measurementId: "G-WTZNDK066P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
