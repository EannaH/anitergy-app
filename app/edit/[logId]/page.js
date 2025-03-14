"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/dist/client/components/navigation";
import { db, auth } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EditLog() {
  const router = useRouter();
  const { logId } = useParams(); // Get logId from the URL
  const [user, setUser] = useState(null);
  const [energy, setEnergy] = useState(0);
  const [situation, setSituation] = useState("");
  const [trigger, setTrigger] = useState("");
  const [emotions, setEmotions] = useState([]); // ✅ Now supports multiple emotions
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchLogDetails(currentUser.uid, logId);
      }
    });
    return () => unsubscribe();
  }, [logId]);

  // Fetch the selected log's details
  const fetchLogDetails = async (userId, logId) => {
    try {
      const logRef = doc(db, "users", userId, "energy_logs", logId);
      const logSnap = await getDoc(logRef);
      if (logSnap.exists()) {
        const logData = logSnap.data();
        setEnergy(logData.energy);
        setSituation(logData.situation);
        setTrigger(logData.trigger);
        setEmotions(logData.emotions || []); // ✅ Now correctly loads multiple emotions
      }
    } catch (error) {
      console.error("Error fetching log:", error);
    }
  };  
;

  // Handle updating the log
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const logRef = doc(db, "users", user.uid, "energy_logs", logId);
      await updateDoc(logRef, {
        energy,
        situation,
        trigger,
        emotions,
      });

      // Redirect back to the main page after editing
      router.push("/");
    } catch (error) {
      console.error("Error updating log:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Edit Your Energy Log</h2>

      <form onSubmit={handleUpdate} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
        <label className="block">
          <span className="text-gray-700">Energy Level (-10 to +10):</span>
          <input
            type="number"
            min="-10"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Situation:</span>
          <input
            type="text"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="E.g., Work Meeting"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Trigger:</span>
          <input
            type="text"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="E.g., Boss"
          />
        </label>

        <label className="block">
  <span className="text-gray-700">Emotions:</span>
  <select
    multiple
    value={emotions}
    onChange={(e) =>
      setEmotions(Array.from(e.target.selectedOptions, (option) => option.value))
    }
    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
  >
    <option value="Happy">Happy</option>
    <option value="Excited">Excited</option>
    <option value="Frustrated">Frustrated</option>
    <option value="Tired">Tired</option>
    <option value="Motivated">Motivated</option>
    <option value="Anxious">Anxious</option>
    <option value="Calm">Calm</option>
    <option value="Overwhelmed">Overwhelmed</option>
  </select>
</label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Log"}
        </button>
      </form>

      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
      >
        Cancel & Go Back
      </button>
    </div>
  );
}
