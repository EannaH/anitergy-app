// app/components/ChartsSection.js
"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ChartsSection({
  logs,
  energyAverages,
  weeklyAverages,
  monthlyAverages,
  HRVData,
  dayInsights,
  emotionHRVCorrelation,
  insights,
}) {
  return (
    <div style={{ position: "relative", paddingTop: "40px" }}>
      <Swiper navigation modules={[Navigation]} spaceBetween={10} slidesPerView={1}>
        {/* Slide 1: Sleep vs. Energy Trends */}
        <SwiperSlide>
          <h2 className="text-xl font-bold mt-6">Sleep vs. Energy Trends</h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <BarChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="energy" fill="#ff4500" name="Energy Level" />
                <Bar dataKey="sleep_hours" fill="#8884d8" name="Sleep Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No sleep vs. energy data available.</p>
          )}
        </SwiperSlide>

        {/* Slide 2: Weekly Sleep Debt & Fatigue Trends */}
        <SwiperSlide>
          <h2 className="text-xl font-bold mt-6">Weekly Sleep Debt & Fatigue Trends</h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="deficit" stroke="#ff0000" strokeWidth={2} name="Sleep Debt (hrs)" />
                <Line type="monotone" dataKey="fatigueLoad" stroke="#ff7300" strokeWidth={2} name="Fatigue Load" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No weekly trend data available.</p>
          )}
        </SwiperSlide>

        {/* Slide 3: Energy Trends */}
        <SwiperSlide>
          <h2 className="text-xl font-bold mt-6">Your Energy Trends</h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                <YAxis domain={[-10, 10]} />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
                <Line type="monotone" dataKey="energy" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No energy logs found.</p>
          )}
        </SwiperSlide>

        {/* Slide 4: Emotion Frequency Pie Chart */}
        <SwiperSlide>
          <h2 className="text-xl font-bold mt-6">Most Frequent Emotions</h2>
          {emotionHRVCorrelation.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <PieChart>
                <Pie data={emotionHRVCorrelation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No emotion data available.</p>
          )}
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
