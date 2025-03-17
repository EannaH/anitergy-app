// app/logs/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLogs = async (userId) => {
    try {
      const logsRef = collection(db, "users", userId, "energy_logs");
      const q = query(logsRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      const logsArray = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.seconds
          ? new Date(docSnap.data().timestamp.seconds * 1000)
          : new Date(),
      }));
      setLogs(logsArray);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleDelete = async (logId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "energy_logs", logId));
      fetchLogs(user.uid);
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Logged Entries</h1>
      {logs.length > 0 ? (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Energy</th>
              <th className="border border-gray-300 px-4 py-2">Situation</th>
              <th className="border border-gray-300 px-4 py-2">Trigger</th>
              <th className="border border-gray-300 px-4 py-2">Emotions</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
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
                  {log.emotions && log.emotions.length > 0 ? log.emotions.join(", ") : "No emotions"}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <Link href={`/edit/${log.id}`} passHref>
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded">✏️ Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(log.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mt-2">No logs found.</p>
      )}
    </div>
  );
}
