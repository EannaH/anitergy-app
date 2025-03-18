"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { emotionOptions } from "@/app/lib/emotions";
import { useParams } from "next/navigation";

export default function EditLogPage() {
  const params = useParams();
  const logId = params?.logId;  
  const [log, setLog] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLog(currentUser.uid);
      } else {
        setError("You must be logged in to edit a log.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch the log from Firestore
  const fetchLog = async (userId) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const logRef = doc(db, "users", userId, "daily_energy", today, "logs", logId);
      const logSnapshot = await getDoc(logRef);

      if (!logSnapshot.exists()) {
        setError("Log not found.");
        setLoading(false);
        return;
      }

      setLog({ id: logSnapshot.id, ...logSnapshot.data() });
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching log:", error);
      setError("Failed to load log.");
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setLog({ ...log, [e.target.name]: e.target.value });
  };

  // Handle log update
  const handleUpdate = async () => {
    try {
      if (!user) return;
      const today = new Date().toISOString().split("T")[0];
      const logRef = doc(db, "users", user.uid, "daily_energy", today, "logs", logId);

      await updateDoc(logRef, {
        energy: Number(log.energy),
        situation: log.situation,
        trigger: log.trigger,
        primary_emotion: log.primary_emotion,
        secondary_emotion: log.secondary_emotion,
      });

      console.log("✅ Log updated successfully!");
      router.push("/logs"); // Redirect back to logs page
    } catch (error) {
      console.error("❌ Error updating log:", error);
      setError("Failed to update log.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Log Entry</h1>

      {loading && <p className="text-gray-500">⏳ Loading log...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {log && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Energy:</span>
            <input
              type="number"
              name="energy"
              value={log.energy}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Situation:</span>
            <input
              type="text"
              name="situation"
              value={log.situation}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Trigger:</span>
            <input
              type="text"
              name="trigger"
              value={log.trigger}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </label>

          {/* Define emotion options */}

<label className="block">
  <span className="text-gray-700">Primary Emotion:</span>
  <select
    name="primary_emotion"
    value={log.primary_emotion}
    onChange={handleChange}
    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
  >
    <option value="">Select an emotion</option>
    {emotionOptions.map((emotion) => (
  <option key={emotion} value={emotion}>
    {emotion}
  </option>
))}

  </select>
</label>

<label className="block">
  <span className="text-gray-700">Secondary Emotion:</span>
  <select
    name="secondary_emotion"
    value={log.secondary_emotion}
    onChange={handleChange}
    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
  >
    <option value="">Select an emotion</option>
    {emotionOptions.map((emotion) => (
      <option key={emotion} value={emotion}>
        {emotion}
      </option>
    ))}
  </select>
</label>


          <button
            onClick={handleUpdate}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push("/logs")}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md mt-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
