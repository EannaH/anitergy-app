// app/components/SmartInsightsCarousel.js
"use client";

import React, { useState } from "react";
import SwipeableViews from "react-swipeable-views";

export default function SmartInsightsCarousel({ dayInsights = [], insights = [] }) {
  // Calculate total slides: one slide per dayInsight plus one extra slide if insights exist
  const extraSlide = insights.length > 0 ? 1 : 0;
  const totalSlides = dayInsights.length + extraSlide;
  
  const [index, setIndex] = useState(0);

  const handleChangeIndex = (newIndex) => {
    setIndex(newIndex);
  };

  return (
    <div style={{ position: "relative", marginTop: "1.5rem" }}>
      <h2 className="text-xl font-bold mt-6">Smart Insights</h2>
      
      {/* Arrow Buttons Positioned Vertically Centered */}
      <button
        onClick={() =>
          setIndex(index > 0 ? index - 1 : totalSlides - 1)
        }
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          fontSize: "32px",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Previous Insight"
      >
        ←
      </button>
      <button
        onClick={() =>
          setIndex((index + 1) % totalSlides)
        }
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          fontSize: "32px",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Next Insight"
      >
        →
      </button>

      <SwipeableViews
  index={index}
  onChangeIndex={handleChangeIndex}
  enableMouseEvents
>
{insights.length > 0 ? (
  <div key="extra-insights" style={{ padding: "1rem" }}>

    <ul className="mt-2 p-4 bg-blue-50 rounded-md shadow-md">
      {insights.map((insight, index) => (
        <li key={index} className="mb-2 text-gray-700">
          {insight}
        </li>
      ))}
    </ul>
  </div>
) : (
  <div key="extra-insights-empty" style={{ padding: "1rem" }} />
)}

  {dayInsights.map((insight, i) => (
    <div key={`day-${i}`} style={{ padding: "1rem" }}>
      <p className="text-gray-700">
        <strong>{insight.day}:</strong>{" "}
        {insight.avgEnergy > 0
          ? `You tend to feel energized (+${insight.avgEnergy.toFixed(1)})`
          : `You tend to feel drained (${insight.avgEnergy.toFixed(1)})`}
      </p>
    </div>
  ))}
</SwipeableViews>

    </div>
  );
}
