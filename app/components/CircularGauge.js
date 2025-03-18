"use client";

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function CircularGauge({ energyLevel = 50 }) {
  return (
    <div style={{ width: "120px", height: "120px" }}>
      <CircularProgressbar
        value={energyLevel}
        text={`${energyLevel}%`}
        styles={buildStyles({
          textSize: "16px",
          pathColor: energyLevel > 50 ? "#4CAF50" : "#FF4500", // Green if high, Red if low
          textColor: "#333",
          trailColor: "#ddd",
        })}
      />
    </div>
  );
}
