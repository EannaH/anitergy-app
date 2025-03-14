"use client"; 

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import Link from "next/link";
import { PieChart, Pie } from "recharts";


export default function EnergyLogger() {
  const [energy, setEnergy] = useState(0);
  const [situation, setSituation] = useState("");
  const [trigger, setTrigger] = useState("");
  const [emotions, setEmotions] = useState([]);  // ✅ Now supports multiple emotions
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]); 
  const [editingLogId, setEditingLogId] = useState(null); 
  const [energyAverages, setEnergyAverages] = useState([]);
  const [weeklyAverages, setWeeklyAverages] = useState([]);
  const [monthlyAverages, setMonthlyAverages] = useState([]);
  const [dayInsights, setDayInsights] = useState([]);
  const [emotionFrequency, setEmotionFrequency] = useState([]);
  const [sleepHours, setSleepHours] = useState(8); // Default to 8 hours
  const [deficit, setDeficit] = useState(0); // Track energy deficit
  const [currentEnergy, setCurrentEnergy] = useState(8); // Default to 8 (full rest)
  const [fatigueLoad, setFatigueLoad] = useState(0); // Stores fatigue load


  const fetchLogs = useCallback(async (userId) => {
    try {
      // Fetch energy logs
      const logsRef = collection(db, "users", userId, "energy_logs");
      const q = query(logsRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      
      const logsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.seconds
          ? new Date(doc.data().timestamp.seconds * 1000)
          : new Date(),
      }));
      
      setLogs(logsArray);
  
      // Fetch today's sleep data
      const today = new Date().toISOString().split("T")[0];
      const sleepRef = doc(db, "users", userId, "daily_energy", today);
      const sleepSnapshot = await getDoc(sleepRef);

      if (sleepSnapshot.exists()) {
        const sleepData = sleepSnapshot.data();
        setSleepHours(sleepData.sleep_hours || 8);
        setDeficit(sleepData.deficit || 0);
        setFatigueLoad(sleepData.fatigueLoad || 0);
        console.log("✅ Sleep Data Retrieved:", sleepData);
    
        // Call energy decay function with sleep data
        calculateEnergyDecay(sleepData.start_energy || 8, sleepData.deficit || 0, sleepData.fatigueLoad || 0);
      } else {
        console.log("❌ No sleep data found for today.");
        setSleepHours(8);
        setDeficit(0);
    
        // Default decay calculation (assumes 8 energy)
        calculateEnergyDecay(8, 0, 0);
      }
    
      // Calculate Daily Energy Averages
      const dailyEnergy = {};
      const dayPatterns = {};  
    
      logsArray.forEach((log) => {
        const date = log.timestamp.toISOString().split("T")[0]; 
        const day = log.timestamp.toLocaleDateString("en-US", { weekday: "long" });
    
        if (!dailyEnergy[date]) {
          dailyEnergy[date] = { total: 0, count: 0 };
        }
        dailyEnergy[date].total += log.energy;
        dailyEnergy[date].count += 1;
    
        if (!dayPatterns[day]) {
          dayPatterns[day] = { total: 0, count: 0 };
        }
        dayPatterns[day].total += log.energy;
        dayPatterns[day].count += 1;
      });
    
      const averageData = Object.keys(dailyEnergy).map((date) => ({
        date,
        avgEnergy: dailyEnergy[date].total / dailyEnergy[date].count,
      }));
    
      setEnergyAverages(averageData);
    
      const dayAverages = Object.keys(dayPatterns).map((day) => ({
        day,
        avgEnergy: dayPatterns[day].total / dayPatterns[day].count,
      }));
    
      setDayInsights(dayAverages);
    
      // Count Emotion Frequency for Pie Chart
      const emotionCounts = {};
      logsArray.forEach((log) => {
        if (log.emotions && Array.isArray(log.emotions)) {
          log.emotions.forEach((emotion) => {
            if (!emotionCounts[emotion]) {
              emotionCounts[emotion] = 0;
            }
            emotionCounts[emotion] += 1;
          });
        }
      });
    
      const emotionData = Object.keys(emotionCounts).map((emotion) => ({
        name: emotion,
        value: emotionCounts[emotion],
      }));
    
      setEmotionFrequency(emotionData);
    
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    }
  }, []);  // Empty dependency array; add dependencies if needed

 // ✅ Runs when user logs in, fetches logs
  // --- Step 2: Update useEffect to Include fetchLogs in Dependency Array ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [fetchLogs]);  // Include fetchLogs here

// ✅ Logs currentEnergy updates to console
useEffect(() => {
  console.log("⚡ Current Energy:", currentEnergy);
}, [currentEnergy]);  // ✅ Logs every time currentEnergy updates


  // ✅ Add this function BEFORE fetchLogs
  const calculateEnergyDecay = (startEnergy, sleepDebt, fatigueLoad) => {
    const now = new Date();
    const wakeUpTime = new Date();
    wakeUpTime.setHours(7, 0, 0, 0);
    const hoursAwake = Math.max(0, (now - wakeUpTime) / (1000 * 60 * 60));
    let decayRate = 0.5;
    decayRate += (sleepDebt / 2) * 0.1;
    let adjustedEnergy = startEnergy - (fatigueLoad * 0.2);
    const decayedEnergy = Math.max(0, adjustedEnergy - (hoursAwake * decayRate));
    setCurrentEnergy(decayedEnergy);
  };
  

 
  
    
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
        console.error("User not authenticated");
        return;
      }
    
      setLoading(true);
      try {
        if (editingLogId) {
          const logRef = doc(db, "users", user.uid, "energy_logs", editingLogId);
          await updateDoc(logRef, {
            energy,
            situation,
            trigger,
            emotions,
            timestamp: serverTimestamp(),
          });
          setEditingLogId(null);
        } else {
          await addDoc(collection(db, "users", user.uid, "energy_logs"), {
            energy,
            situation,
            trigger,
            emotions,
            timestamp: serverTimestamp(),
          });
        }
    
        // ✅ Save Sleep Data
        await saveSleepData(user.uid, sleepHours);
    
        // ✅ Clear fields after saving
        setEnergy(0);
        setSituation("");
        setTrigger("");
        setEmotions([]);
        setSleepHours(8); // Reset sleep to default
    
        fetchLogs(user.uid);
      } catch (error) {
        console.error("Error saving log:", error);
      }
    
      setLoading(false);
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

  const handleEdit = (log) => {
    setEnergy(log.energy);
    setSituation(log.situation);
    setTrigger(log.trigger);
    setEmotions(log.emotions || []); // Ensure it's an array
    setEditingLogId(log.id);
  };

  const saveSleepData = async (userId, sleepHours) => {
    if (!userId) return console.error("User not authenticated");
  
    try {
      const today = new Date().toISOString().split("T")[0];
      const sleepRef = doc(db, "users", userId, "daily_energy", today);
      const sleepSnapshot = await getDoc(sleepRef);
      
      let previousDeficit = 0;
      let previousFatigue = 0;
  
      if (sleepSnapshot.exists()) {
        previousDeficit = sleepSnapshot.data().deficit || 0;
        previousFatigue = sleepSnapshot.data().fatigueLoad || 0;
      }
  
      // ✅ Calculate new sleep debt
      let newDeficit = sleepHours < 8 ? previousDeficit + (8 - sleepHours) : Math.max(0, previousDeficit - (sleepHours - 8));
  
      // ✅ Long-Term Fatigue Load Increases When Debt Persists
      let newFatigueLoad = previousFatigue + (newDeficit > 10 ? 0.2 * newDeficit : 0); // If debt >10 hrs, increase fatigue
  
      // ✅ Set starting energy with fatigue effects
      let startEnergy = Math.max(3, 8 - newFatigueLoad); // Fatigue lowers starting energy
  
      await setDoc(sleepRef, {
        sleep_hours: sleepHours,
        start_energy: startEnergy,
        deficit: newDeficit,
        fatigueLoad: newFatigueLoad,
      });
  
      console.log("✅ Sleep Data Saved:", { sleepHours, startEnergy, newDeficit, newFatigueLoad });
  
      setDeficit(newDeficit);
    } catch (error) {
      console.error("❌ Error saving sleep data:", error);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        {editingLogId ? "Edit Your Energy Log" : "Log Your Energy"}
      </h2>

      {/* ✅ Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
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
    {/* ✅ Energy-Boosting Emotions */}
    <optgroup label="🔋 Energy-Boosting Emotions">
      <option value="Joy">Joy – Brings lightness and excitement</option>
      <option value="Gratitude">Gratitude – Reinforces a sense of abundance</option>
      <option value="Love">Love – Strengthens emotional connections</option>
      <option value="Pride">Pride – Boosts confidence and self-worth</option>
      <option value="Excitement">Excitement – Energizes and motivates action</option>
      <option value="Relief">Relief – Signals the removal of stress</option>
      <option value="Contentment">Contentment – A calm, sustainable energy state</option>
      <option value="Hope">Hope – Creates motivation and resilience</option>
      <option value="Amusement">Amusement – Generates light-hearted energy</option>
      <option value="Confidence">Confidence – Increases self-efficacy and drive</option>
    </optgroup>

    {/* ⚡ Energy-Draining Emotions */}
    <optgroup label="⚡ Energy-Draining Emotions">
      <option value="Anger">Anger – High-energy but emotionally exhausting</option>
      <option value="Frustration">Frustration – A mental drain from unresolved obstacles</option>
      <option value="Fear">Fear – Triggers survival responses and tension</option>
      <option value="Sadness">Sadness – Lowers motivation and creates fatigue</option>
      <option value="Guilt">Guilt – Creates a self-punishing cycle</option>
      <option value="Shame">Shame – Depletes self-esteem and mental clarity</option>
      <option value="Loneliness">Loneliness – Causes emotional depletion over time</option>
      <option value="Disgust">Disgust – Drains energy through aversion</option>
      <option value="Jealousy">Jealousy – Mixes insecurity and resentment, taxing mental energy</option>
      <option value="Regret">Regret – Mentally exhausting if ruminated on</option>
    </optgroup>
  </select>
</label>

<label className="block">
  <span className="text-gray-700">Hours Slept:</span>
  <input
    type="number"
    min="0"
    max="12"
    value={sleepHours}
    onChange={(e) => setSleepHours(parseInt(e.target.value))}
    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
  />
</label>

<button
  type="submit"
  style={{ padding: '10px', backgroundColor: '#4285F4', color: 'white', borderRadius: '5px' }}
  disabled={loading}
>
  {loading ? "Saving..." : editingLogId ? "Update Log" : "Log Energy"}
</button>

      </form>

      {/* ✅ Sleep & Fatigue Stats */}
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

{/* ✅ Sleep vs. Energy Chart */}
<h2 className="text-xl font-bold mt-6">Sleep vs. Energy Trends</h2>

{logs.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <BarChart data={logs}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="energy" fill="#ff4500" name="Energy Level" />
      <Bar dataKey="sleep_hours" fill="#8884d8" name="Sleep Hours" />
    </BarChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No sleep vs. energy data available.</p>
)}

{/* ✅ Weekly Sleep Debt & Fatigue Load */}
<h2 className="text-xl font-bold mt-6">Weekly Sleep Debt & Fatigue Trends</h2>

{logs.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <LineChart data={logs}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="deficit" stroke="#ff0000" strokeWidth={2} name="Sleep Debt (hrs)" />
      <Line type="monotone" dataKey="fatigueLoad" stroke="#ff7300" strokeWidth={2} name="Fatigue Load" />
    </LineChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No weekly trend data available.</p>
)}


      {/* ✅ Energy Trends Graph */}
      <h2 className="text-xl font-bold mt-6">Your Energy Trends</h2>
      {logs.length > 0 ? (
        <ResponsiveContainer width="100%" height={250} className="mt-4">
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
            />
            <YAxis domain={[-10, 10]} />
            <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
            <Line type="monotone" dataKey="energy" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 mt-2">No energy logs found.</p>
      )}

      {/* ✅ Daily Average Energy Trends */}
<h2 className="text-xl font-bold mt-6">Daily Average Energy Trends</h2>

{energyAverages.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <BarChart data={energyAverages}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis domain={[-10, 10]} />
      <Tooltip />
      <Bar dataKey="avgEnergy" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No trend data available.</p>
)}

{/* ✅ Weekly Average Energy Trends */}
<h2 className="text-xl font-bold mt-6">Weekly Average Energy Trends</h2>

{weeklyAverages.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <BarChart data={weeklyAverages}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="period" />
      <YAxis domain={[-10, 10]} />
      <Tooltip />
      <Bar dataKey="avgEnergy" fill="#ffa500" />
    </BarChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No weekly trend data available.</p>
)}

{/* ✅ Monthly Average Energy Trends */}
<h2 className="text-xl font-bold mt-6">Monthly Average Energy Trends</h2>

{monthlyAverages.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <BarChart data={monthlyAverages}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="period" />
      <YAxis domain={[-10, 10]} />
      <Tooltip />
      <Bar dataKey="avgEnergy" fill="#ff4500" />
    </BarChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No monthly trend data available.</p>
)}

{/* ✅ Smart Insights Based on Day Patterns */}
<h2 className="text-xl font-bold mt-6">Smart Insights</h2>

{dayInsights.length > 0 ? (
  <ul className="mt-4 p-4 bg-gray-100 rounded-md">
    {dayInsights.map((insight) => (
      <li key={insight.day} className="mb-2">
        <strong>{insight.day}:</strong>{" "}
        {insight.avgEnergy > 0
          ? `You tend to feel energized (+${insight.avgEnergy.toFixed(1)})`
          : `You tend to feel drained (${insight.avgEnergy.toFixed(1)})`}
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-500 mt-2">No insights available yet.</p>
)}

{/* ✅ Emotion Frequency Pie Chart */}
<h2 className="text-xl font-bold mt-6">Most Frequent Emotions</h2>

{emotionFrequency.length > 0 ? (
  <ResponsiveContainer width="100%" height={250} className="mt-4">
    <PieChart>
      <Pie
        data={emotionFrequency}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        label
      />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
) : (
  <p className="text-gray-500 mt-2">No emotion data available.</p>
)}


      {/* ✅ Logs Table with Edit & Delete Buttons */}
      <h2 className="text-xl font-bold mt-6">Your Logged Entries</h2>
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
        <button onClick={() => handleDelete(log.id)} className="bg-red-500 text-white px-2 py-1 rounded">❌ Delete</button>
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
