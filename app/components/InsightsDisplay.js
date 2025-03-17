// app/components/InsightsDisplay.js
"use client";

export default function InsightsDisplay({ insights = [] }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Smart Insights</h2>
      {insights.length > 0 ? (
        <ul className="mt-4 p-4 bg-blue-50 rounded-md shadow-md">
          {insights.map((insight, index) => (
            <li key={index} className="mb-2 text-gray-700">
              {insight}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">No insights available yet.</p>
      )}
    </div>
  );
}
