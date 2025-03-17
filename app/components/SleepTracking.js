"use client";

export default function SleepTracking({ deficit, fatigueLoad }) {
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md mt-6">
      <h2 className="text-xl font-bold">Sleep & Fatigue Overview</h2>
      
      <p className="mt-2">
        <strong>📉 Sleep Debt:</strong> 
        <span className={deficit > 4 ? "text-red-500 font-bold" : "text-green-500"}>
          {deficit} hours
        </span>
      </p>

      <p>
        <strong>⚡ Fatigue Load:</strong> 
        <span className={typeof fatigueLoad !== "undefined" && fatigueLoad > 5 ? "text-red-500 font-bold" : "text-green-500"}>
          {typeof fatigueLoad !== "undefined" ? fatigueLoad.toFixed(1) : "0.0"}
        </span>
      </p>

      <p className="mt-2 text-gray-500">
        {deficit > 4
          ? "🚨 High Sleep Debt! Your energy will drain faster."
          : "✅ Sleep levels are within a healthy range."
        }
      </p>

      <p className="text-gray-500">
        {typeof fatigueLoad !== "undefined" && fatigueLoad > 5
          ? "⚠️ Chronic fatigue detected. Long-term recovery is needed."
          : "💪 You're managing fatigue well!"
        }
      </p>
    </div>
  );
}
