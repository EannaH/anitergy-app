// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace the configuration below with your own Firebase project details
const firebaseConfig = {
  apiKey: "AIzaSyCg7yFjUejqgh21gLK2sbeviBcwGjyaXYY",
  authDomain: "energy-tracker-app.firebaseapp.com",
  projectId: "energy-tracker-app",
  storageBucket: "energy-tracker-app.firebasestorage.app",
  messagingSenderId: "626832007055",
  appId: "1:626832007055:web:3dad3ddb4f578cb80ab5fa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // ✅ Initialize Firebase Authentication
const provider = new GoogleAuthProvider();  // ✅ Set up Google Sign-In
// Initialize Firestore and export it for use in other parts of your app
export { db, auth, provider };  // ✅ Export auth and provider