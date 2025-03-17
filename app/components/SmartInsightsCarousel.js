// app/components/SmartInsightsCarousel.js
"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

export default function SmartInsightsCarousel({ dayInsights = [], insights = [] }) {
  return (
    <div style={{ position: "relative", marginTop: "1.5rem" }}>
      <h2 className="text-xl font-bold mt-6">Smart Insights</h2>

      <Swiper navigation modules={[Navigation]} spaceBetween={10} slidesPerView={1}>
        {insights.length > 0 && (
          <SwiperSlide key="extra-insights">
            <ul className="mt-2 p-4 bg-blue-50 rounded-md shadow-md">
              {insights.map((insight, index) => (
                <li key={index} className="mb-2 text-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          </SwiperSlide>
        )}

        {dayInsights.map((insight, i) => (
          <SwiperSlide key={`day-${i}`}>
            <p className="text-gray-700">
              <strong>{insight.day}:</strong>{" "}
              {insight.avgEnergy > 0
                ? `You tend to feel energized (+${insight.avgEnergy.toFixed(1)})`
                : `You tend to feel drained (${insight.avgEnergy.toFixed(1)})`}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
