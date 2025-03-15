"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "../lib/firebase"; 
import { 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  // Email/Password Sign-In or Register
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
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

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4285F4',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              marginBottom: '10px',
            }}
          >
            Sign in with Google
          </button>

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
          <p style={{ color: '#444', marginBottom: '8px' }}>Hello, {user.displayName || user.email}!</p>
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
