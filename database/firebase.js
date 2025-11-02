import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3gM0QFeOmyAJgQm4nYUyu2KEOWz5eS8M", // Add your apiKey here
  authDomain: "roomieschore.firebaseapp.com",
  projectId: "roomieschore",
  storageBucket: "roomieschore.firebasestorage.app",
  messagingSenderId: "124104185421",
  appId: "1:124104185421:web:fde2a790f98d6ec9606e04",
  measurementId: "G-WTZNDK066P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);
