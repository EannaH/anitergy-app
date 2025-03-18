"use client"; 

import React, { useState, useEffect } from "react";
import CircularGauge from "./CircularGauge"; // ✅ Import the gauge
import EnergyBar from "./EnergyBar";
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EnergyDashboard() {
  const [currentEnergy, setCurrentEnergy] = useState(0); // Default to center position (0)

  useEffect(() => {
    let unsubscribe = () => {};

    const subscribeToEnergyUpdates = (userId) => {
      const today = new Date().toISOString().split("T")[0];
      const energyRef = doc(db, "users", userId, "daily_energy", today);

      unsubscribe = onSnapshot(energyRef, (docSnap) => {
        if (docSnap.exists()) {
          const energyData = docSnap.data();
          setCurrentEnergy(energyData.start_energy || 50);
          console.log("🔄 Live update received:", energyData);
        }
      });
    };

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        subscribeToEnergyUpdates(user.uid);
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "20px",
      padding: "10px",
      border: "1px solid #ccc"
    }}>
      
      {/* ✅ Circular Gauge for Live Energy */}
      <CircularGauge energyLevel={currentEnergy} />

      {/* ✅ Live Updating Energy Bar */}
      <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
        Energy Level: {currentEnergy}%
      </p>
      <EnergyBar energyLevel={currentEnergy} />

      {/* ✅ Energy Logging Controls */}
      <div style={{
        marginTop: "20px",
        textAlign: "center",
        width: "100%", // Ensures full width
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>

        <p style={{ fontWeight: "bold" }}>- Enter Your Energy! +</p>

        {/* Slider + +/- Buttons Aligned */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
        }}>
          
          {/* ➖ Button on the Left */}
          <button
            onClick={() => setCurrentEnergy((prev) => Math.max(prev - 1, -10))}
            style={{
              padding: "8px 12px",
              fontSize: "16px",
              backgroundColor: "#ff4500",
              color: "white",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ➖
          </button>

          {/* Energy Slider in the Middle */}
          <input
  type="range"
  min="-10"
  max="10"
  value={currentEnergy}
  onChange={(e) => {
    setCurrentEnergy(parseInt(e.target.value)); // ✅ Only update local state
  }}
  style={{
    width: "80%", // 🔥 Your preferred width
    maxWidth: "800px",
    margin: "0 10px",
  }}
/>


          {/* ➕ Button on the Right */}
          <button
            onClick={() => setCurrentEnergy((prev) => Math.min(prev + 1, 10))}
            style={{
              padding: "8px 12px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ➕
          </button>

        </div>
      </div>
    </div>
  );
}
