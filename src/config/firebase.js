import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7f77-3akMbUOXlR3W2dZEvKtIKnEpVXQ",
  authDomain: "adixon-6a30e.firebaseapp.com",
  projectId: "adixon-6a30e",
  storageBucket: "adixon-6a30e.firebasestorage.app",
  messagingSenderId: "757740367272",
  appId: "1:757740367272:web:fd76d81f2cd116c7df819d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
