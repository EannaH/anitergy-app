"use client"; // Ensures client-side rendering

import LoginButton from "./components/LoginButton";  // ✅ FIXED PATH
import EnergyLogger from "./components/EnergyLogger";  // ✅ FIXED PATH

export default function Home() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Energy Tracker</h1>

      {/* Login Button */}
      <LoginButton />

      {/* Energy Logging Form */}
      <EnergyLogger />
    </div>
  );
}
