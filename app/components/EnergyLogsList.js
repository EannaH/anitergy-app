"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EnergyLogsList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchLogs(userId) {
    try {
      setLoading(true);

      // Get today's date as YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      console.log(`🔍 Fetching logs for user: ${userId} on ${today}`);

      // Reference to the correct Firestore path
      const logsRef = collection(db, "users", userId, "daily_energy", today, "logs");

      console.log(`🛠️ Firestore Path: users/${userId}/daily_energy/${today}/logs`);

      // Fetch documents in descending timestamp order
      const q = query(logsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn("⚠️ No logs found for today.");
        setLogs([]);
      } else {
        console.log(`✅ Retrieved ${querySnapshot.docs.length} logs from Firestore.`);
      }

      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.seconds
          ? new Date(doc.data().timestamp.seconds * 1000).toLocaleString()
          : "N/A",
      }));

      console.log("📊 Logs Data:", logsData);

      setLogs(logsData);
    } catch (error) {
      console.error("❌ Error fetching logs: ", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Logged Energy Data</h2>
      {logs.length === 0 ? (
        <p>No logs found for today.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id} className="mb-2 border-b pb-2">
              <p><strong>Energy:</strong> {log.energy}</p>
              <p><strong>Description:</strong> {log.description}</p>
              <p><strong>Trigger:</strong> {log.trigger}</p>
              <p><strong>Primary Emotion:</strong> {log.primary_emotion}</p>
              <p><strong>Secondary Emotion:</strong> {log.secondary_emotion || "None"}</p>
              <p><strong>Sleep Hours:</strong> {log.sleepHours || "N/A"}</p>
              <p><strong>Time:</strong> {log.timestamp}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
