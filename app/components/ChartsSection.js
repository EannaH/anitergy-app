// app/components/ChartsSection.js
"use client";

import React from "react";
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
      <Swiper navigation modules={[Navigation]} spaceBetween={10} slidesPerView={1} style={{ height: "auto", minHeight: "450px" }}>
        {/* Slide 1: Sleep vs. Energy Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Sleep vs. Energy Trends</h2>
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
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
          </div>
        </SwiperSlide>

        {/* Slide 2: Weekly Sleep Debt & Fatigue Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Weekly Sleep Debt & Fatigue Trends</h2>
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
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
          </div>
        </SwiperSlide>

        {/* Slide 3: Energy Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Your Energy Trends</h2>
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
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
          </div>
        </SwiperSlide>

        {/* Slide 4: Daily Average Energy Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Daily Average Energy Trends</h2>
            {energyAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
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
        </SwiperSlide>

        {/* Slide 5: Weekly Average Energy Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Weekly Average Energy Trends</h2>
            {weeklyAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
                <BarChart data={weeklyAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[-10, 10]} />
                  <Tooltip />
                  <Bar dataKey="avgEnergy" fill="#ffa500" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 mt-2">No weekly trend data available.</p>
            )}
          </div>
        </SwiperSlide>

        {/* Slide 6: Monthly Average Energy Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Monthly Average Energy Trends</h2>
            {monthlyAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
                <BarChart data={monthlyAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[-10, 10]} />
                  <Tooltip />
                  <Bar dataKey="avgEnergy" fill="#ff4500" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 mt-2">No monthly trend data available.</p>
            )}
          </div>
        </SwiperSlide>

        {/* Slide 7: Simulated HRV Trends */}
        <SwiperSlide>
          <div className="chart-slide">
            <h2 className="text-xl font-bold mt-6">Simulated Oura HRV Trends</h2>
            {HRVData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="mt-4">
                <LineChart data={HRVData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[20, 120]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="HRV" stroke="#007aff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 mt-2">No HRV data available.</p>
            )}
          </div>
        </SwiperSlide>

        {/* Slide 8: Emotions Pie Chart */}
        <SwiperSlide>
  <div className="chart-slide" style={{ minHeight: "450px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <h2 className="text-xl font-bold mt-6">Most Frequent Emotions</h2>
    {emotionHRVCorrelation.length > 0 ? (
      <ResponsiveContainer width="100%" height={350} className="mt-4">
        <PieChart>
          <Pie data={emotionHRVCorrelation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-gray-500 mt-2">No emotion data available.</p>
    )}
  </div>
</SwiperSlide>

      </Swiper>
    </div>
  );
}
