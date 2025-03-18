"use client"; // Ensures client-side rendering

import LoginButton from "../components/LoginButton";
import EnergyLogger from "../components/EnergyLogger";
// import EnergyDashboard from "../components/EnergyDashboard";

export default function Home() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Energy Tracker</h1>

      {/* Login Button */}
      <LoginButton />

      {/* Optional: Insert the new EnergyDashboard here */}
{/* <EnergyDashboard /> */}

      {/* Energy Logging Form */}
      <EnergyLogger />
    </div>
  );
}
