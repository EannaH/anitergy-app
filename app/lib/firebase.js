// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "energy-tracker-app.firebaseapp.com",
  projectId: "energy-tracker-app",
  storageBucket: "energy-tracker-app.firebasestorage.app",
  messagingSenderId: "626832007055",
  appId: "1:626832007055:web:3dad3ddb4f578cb80ab5fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);  // ✅ Ensures authentication is initialized

// Export Firebase services for use in other parts of the app
export { db, auth };