"use client";

import { auth, provider } from "../lib/firebase"; // ✅ Ensure the path is correct
import { signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

export default function LoginButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {!user ? (
        <button
          onClick={handleLogin}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4285F4', // Google blue
            color: 'white',
            borderRadius: '5px',
            border: 'none',
          }}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <p style={{ color: '#444', marginBottom: '8px' }}>Hello, {user.displayName}!</p>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              backgroundColor: '#DB4437', // Google red
              color: 'white',
              borderRadius: '5px',
              border: 'none',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );  
}
