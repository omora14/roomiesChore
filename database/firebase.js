// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: "roomieschore.firebaseapp.com",
  projectId: "roomieschore",
  storageBucket: "roomieschore.firebasestorage.app",
  messagingSenderId: "124104185421",
  appId: "1:124104185421:web:fde2a790f98d6ec9606e04",
  measurementId: "G-WTZNDK066P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);