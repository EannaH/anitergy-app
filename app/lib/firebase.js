// lib/firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "energy-tracker-app.firebaseapp.com",
  projectId: "energy-tracker-app",
  storageBucket: "energy-tracker-app.firebasestorage.app",
  messagingSenderId: "626832007055",
  appId: "1:626832007055:web:3dad3ddb4f578cb80ab5fa"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore with persistent cache (New method)
const db = initializeFirestore(app, {
  cache: {
    type: "persistent",
  }
});

console.log("🔄 Firestore cache set to persistent IndexedDB");

// ✅ Initialize Authentication
const auth = getAuth(app);

// ✅ Export Firebase services for use in other parts of the app
export { db, auth };
