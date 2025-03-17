// app/components/ChartsSection.js
"use client";

import React, { useState } from "react";
import SwipeableViews from "react-swipeable-views";
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
  const [index, setIndex] = useState(0);
  const totalSlides = 8; // total number of slides

  const handleChangeIndex = (newIndex) => {
    setIndex(newIndex);
  };

  return (
    <div style={{ position: "relative", paddingTop: "40px" }}>
      {/* Arrow Navigation Positioned Vertically Centered */}
      <button
        onClick={() => setIndex(index > 0 ? index - 1 : totalSlides - 1)}
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
        aria-label="Previous Slide"
      >
        ←
      </button>
      <button
        onClick={() => setIndex((index + 1) % totalSlides)}
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
        aria-label="Next Slide"
      >
        →
      </button>

      <SwipeableViews
        index={index}
        onChangeIndex={handleChangeIndex}
        enableMouseEvents
      >
        {/* Slide 1: Sleep vs. Energy Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">Sleep vs. Energy Trends</h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <BarChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) =>
                    new Date(time).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="energy" fill="#ff4500" name="Energy Level" />
                <Bar
                  dataKey="sleep_hours"
                  fill="#8884d8"
                  name="Sleep Hours"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">
              No sleep vs. energy data available.
            </p>
          )}
        </div>

        {/* Slide 2: Weekly Sleep Debt & Fatigue Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">
            Weekly Sleep Debt & Fatigue Trends
          </h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) =>
                    new Date(time).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="deficit"
                  stroke="#ff0000"
                  strokeWidth={2}
                  name="Sleep Debt (hrs)"
                />
                <Line
                  type="monotone"
                  dataKey="fatigueLoad"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Fatigue Load"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">
              No weekly trend data available.
            </p>
          )}
        </div>

        {/* Slide 3: Your Energy Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">Your Energy Trends</h2>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) =>
                    new Date(time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis domain={[-10, 10]} />
                <Tooltip
                  labelFormatter={(label) =>
                    new Date(label).toLocaleString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No energy logs found.</p>
          )}
        </div>

        {/* Slide 4: Daily Average Energy Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">
            Daily Average Energy Trends
          </h2>
          {energyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <BarChart data={energyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-10, 10]} />
                <Tooltip />
                <Bar dataKey="avgEnergy" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No trend data available.</p>
          )}
        </div>

        {/* Slide 5: Weekly Average Energy Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">
            Weekly Average Energy Trends
          </h2>
          {weeklyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <BarChart data={weeklyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[-10, 10]} />
                <Tooltip />
                <Bar dataKey="avgEnergy" fill="#ffa500" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No weekly trend data available.</p>
          )}
        </div>

        {/* Slide 6: Monthly Average Energy Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">
            Monthly Average Energy Trends
          </h2>
          {monthlyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <BarChart data={monthlyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[-10, 10]} />
                <Tooltip />
                <Bar dataKey="avgEnergy" fill="#ff4500" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No monthly trend data available.</p>
          )}
        </div>

        {/* Slide 7: Simulated HRV Trends */}
        <div>
          <h2 className="text-xl font-bold mt-6">
            Simulated Oura HRV Trends (Last 30 days)
          </h2>
          {HRVData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <LineChart data={HRVData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[20, 120]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="HRV"
                  stroke="#007aff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No HRV data available.</p>
          )}
        </div>

  

        {/* Slide 8: Emotion Frequency Pie Chart */}
        <div>
          <h2 className="text-xl font-bold mt-6">Most Frequent Emotions</h2>
          {emotionHRVCorrelation.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <PieChart>
                <Pie
                  data={emotionHRVCorrelation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 mt-2">No emotion data available.</p>
          )}
        </div>

      </SwipeableViews>
    </div>
  );
}
