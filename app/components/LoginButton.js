"use client";

import { useState, useEffect } from "react";
import { auth } from "../lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fixed password for dev phase
  const DEFAULT_PASSWORD = "Anitergy123!";

  // Auto-register user with default password
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      } else {
        await signInWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Sign-Out
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      {!user ? (
        <>
          <h2>{isRegistering ? "Register" : "Sign In"}</h2>

          {/* Email Input */}
          <form onSubmit={handleEmailAuth} style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            />

            {/* Hidden Password Field (Auto-filled in the background) */}
            <input
              type="hidden"
              value={DEFAULT_PASSWORD} 
            />

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {isRegistering ? "Register" : "Sign In"}
            </button>
          </form>

          {/* Toggle Between Login/Register */}
          <p 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ color: '#4285F4', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? "Already have an account? Sign in" : "New here? Register"}
          </p>

          {/* Error Message */}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </>
      ) : (
        <div>
          <p style={{ color: '#444', marginBottom: '8px' }}>Hello, {user.email}!</p>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              backgroundColor: '#DB4437',
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
