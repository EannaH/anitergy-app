// app/logs/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      } else {
        console.warn("⚠ User not logged in.");
        setLogs([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch logs from Firestore (Updated Path)
  const fetchLogs = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching logs for user:", userId);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      const logsPath = `users/${userId}/daily_energy/${today}/logs`;
      console.log(`🛠 Checking Firestore Path: ${logsPath}`);

      // Fetch logs
      const logsRef = collection(db, "users", userId, "daily_energy", today, "logs");
      const q = query(logsRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("✅ Firestore logs exist! Processing...");
      } else {
        console.warn("⚠ No logs found at path:", logsPath);
      }

      const logsArray = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.seconds
          ? new Date(docSnap.data().timestamp.seconds * 1000)
          : new Date(),
      }));

      console.log("🔥 Final Logs Data:", logsArray);
      setLogs(logsArray);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
      setError("Failed to load logs. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!user) {
      console.error("❌ No authenticated user. Cannot delete.");
      return;
    }

    try {
      // Get today's date to match Firestore path
      const today = new Date().toISOString().split("T")[0];

      console.log(`🗑 Deleting log: ${logId} for user ${user.uid}`);

      await deleteDoc(doc(db, "users", user.uid, "daily_energy", today, "logs", logId));

      console.log("✅ Log deleted successfully:", logId);

      fetchLogs(user.uid); // Refresh logs
    } catch (error) {
      console.error("❌ Error deleting log:", error);
    }
  };


  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Logged Entries</h1>

      {loading && <p className="text-gray-500">⏳ Loading logs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {logs.length > 0 ? (
        <>
          <p className="text-gray-700">✅ {logs.length} logs loaded.</p>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Energy</th>
                <th className="border border-gray-300 px-4 py-2">Situation</th>
                <th className="border border-gray-300 px-4 py-2">Trigger</th>
                <th className="border border-gray-300 px-4 py-2">Emotions</th>
              </tr>
            </thead>
            <tbody>
  {logs.map((log) => (
    <tr key={log.id} className="text-center">
      <td className={`border px-4 py-2 ${log.energy < 0 ? "text-red-500" : "text-green-500"}`}>
        {log.energy}
      </td>
      <td className="border px-4 py-2">{log.situation}</td>
      <td className="border px-4 py-2">{log.trigger || "No trigger"}</td>
      <td className="border px-4 py-2">
      {log.primary_emotion || log.secondary_emotion ? (
  <>
    {log.primary_emotion && <span>{log.primary_emotion}</span>}
    {log.secondary_emotion && <span>{log.primary_emotion ? `, ${log.secondary_emotion}` : log.secondary_emotion}</span>}
  </>
) : (
  "No emotions"
)}


      </td>
      <td className="border px-4 py-2 space-x-2">
      <Link href={`/logs/${log.id}/edit`} passHref>
          <button className="bg-yellow-500 text-white px-2 py-1 rounded">✏️ Edit</button>
        </Link>
        <button 
          onClick={() => handleDelete(log.id)}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          ❌ Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>

          <button
  onClick={() => router.push("/")}
  className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md w-full"
>
  ⬅️ Back to Main Screen
</button>


        </>
      ) : (
        !loading && <p className="text-gray-500 mt-2">No logs found.</p>
      )}
    </div>
  );
}
