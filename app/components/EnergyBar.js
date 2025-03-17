"use client";

import React from "react";

export default function EnergyBar({ energyLevel = 50 }) {
  return (
    <div style={{
      width: "80%",
      height: "20px",
      backgroundColor: "#eee",
      borderRadius: "10px",
      overflow: "hidden",
      position: "relative",
      border: "1px solid #ccc",
    }}>
      <div style={{
        width: `${energyLevel}%`, // Dynamically adjusts based on energyLevel
        height: "100%",
        backgroundColor: energyLevel > 50 ? "#4CAF50" : "#FF4500", // Green if high, Red if low
        transition: "width 0.5s ease-in-out"
      }} />
    </div>
  );
}
