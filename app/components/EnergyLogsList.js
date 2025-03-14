"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function EnergyLogsList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        // Create a query to fetch documents from the "energyLogs" collection,
        // ordered by timestamp descending
        const q = query(collection(db, "energyLogs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const logsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching logs: ", error);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Logged Energy Data</h2>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id} className="mb-2 border-b pb-2">
              <p>
                <strong>Energy:</strong> {log.energy}
              </p>
              <p>
                <strong>Description:</strong> {log.description}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {log.timestamp
                  ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                  : "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
