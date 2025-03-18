"use client"; 

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import Link from "next/link";
import { PieChart, Pie } from "recharts";
import simulateHRV from '../lib/simulateOuraHRV';
import EnergyForm from "./EnergyForm"; // Adjust the path if needed
import SleepTracking from "./SleepTracking";
import ChartsSection from "./ChartsSection";
import InsightsDisplay from "./InsightsDisplay";
import SmartInsightsCarousel from "./SmartInsightsCarousel";





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
  const [HRVData, setHRVData] = useState([]);
  const [emotionHRVCorrelation, setEmotionHRVCorrelation] = useState([]);
  const [insights, setInsights] = useState([]);  // ✅ clearly newly added state
  


  const fetchLogs = useCallback(async (userId) => {
    try {
      // ✅ Ensure HRV Data is loaded before executing correlation logic
      if (HRVData.length === 0) {
        console.log("⏳ Waiting for HRV data before fetching logs...");
        return; // Prevents execution until HRV data is loaded
      }
  
      console.log("✅ HRV Data Loaded, Fetching Logs...");
  
      // Fetch energy logs
      console.log("🔍 Fetching Firestore logs for user:", userId);

      console.log(`🛠️ Checking Firestore Path: users/${userId}/energy_logs`);

      console.log(`🛠️ Checking Firestore Path: users/${userId}/energy_logs`);

      const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const logsRef = collection(db, "users", userId, "daily_energy", today, "logs");
      
      
      
      console.log("🧐 Fetching logs without orderBy for debugging...");
      let testSnapshot;
      try {
          testSnapshot = await getDocs(logsRef);
      } catch (error) {
          console.error("❌ Firestore test query failed (without orderBy):", error);
          testSnapshot = null;
      }
      
      // 🔍 Check if Firestore returned data
      if (testSnapshot && !testSnapshot.empty) {
          console.log("✅ Firestore logs exist! Raw data (without orderBy):");
          testSnapshot.forEach(doc => console.log("📌 Doc ID:", doc.id, "Data:", doc.data()));
      } else {
          console.warn("⚠️ No logs found even without orderBy. Something is wrong.");
      }
      
      
      if (!testSnapshot || testSnapshot.empty) {
          console.warn("⚠️ No logs found even without orderBy. Something is wrong.");
      } else {
          console.log("✅ Logs exist without orderBy:");
          testSnapshot.forEach(doc => console.log(doc.id, doc.data()));
      }
      
      // Now attempt ordered query
      const q = query(logsRef, orderBy("timestamp", "asc"));
      let querySnapshot;
      
      try {
          querySnapshot = await getDocs(q);
      } catch (error) {
          console.error("❌ Firestore query failed:", error);
          querySnapshot = null;
      }
      
      
      
      if (!querySnapshot || querySnapshot.empty) {
          console.warn("⚠️ No logs found in Firestore.");
          setLogs([]); // Ensure state is set even if no logs are found
          return;
      }
      
      console.log("🔥 Firestore Data Before Processing:", querySnapshot.docs.map((doc) => doc.data()));
      

      const logsArray = querySnapshot.docs.map((doc) => {
        const rawData = doc.data();
        console.log(`📌 Checking Firestore Entry:`, rawData);
        return {
          id: doc.id,
          ...rawData,
          timestamp: rawData.timestamp?.seconds
            ? new Date(rawData.timestamp.seconds * 1000)
            : new Date(),
        };
      });
      
  
      console.log("🔥 Full Energy Logs from Firestore:", logsArray);
      setLogs(logsArray);

// ✅ Compute daily energy averages
const groupedByDay = logsArray.reduce((acc, log) => {
  const date = log.timestamp.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  if (!acc[date]) acc[date] = [];
  acc[date].push(log.energy);
  return acc;
}, {});

// ✅ Calculate averages
const energyAveragesData = Object.keys(groupedByDay).map((date) => ({
  date,
  avgEnergy:
    groupedByDay[date].reduce((sum, energy) => sum + energy, 0) /
    groupedByDay[date].length,
}));

console.log("📊 Daily Energy Averages Data:", energyAveragesData);
setEnergyAverages(energyAveragesData);
setDayInsights(energyAveragesData);


// ✅ Compute weekly energy averages
const groupedByWeek = logsArray.reduce((acc, log) => {
  const weekStart = new Date(log.timestamp);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get start of the week
  const weekKey = weekStart.toISOString().split('T')[0];

  if (!acc[weekKey]) acc[weekKey] = [];
  acc[weekKey].push(log.energy);
  return acc;
}, {});

// ✅ Calculate weekly averages
const weeklyAveragesData = Object.keys(groupedByWeek).map((week) => ({
  week,
  avgEnergy:
    groupedByWeek[week].reduce((sum, energy) => sum + energy, 0) /
    groupedByWeek[week].length,
}));

console.log("📊 Weekly Energy Averages Data:", weeklyAveragesData);
setWeeklyAverages(weeklyAveragesData);

// ✅ Compute monthly energy averages
const groupedByMonth = logsArray.reduce((acc, log) => {
  const monthKey = log.timestamp.toISOString().slice(0, 7); // Format as YYYY-MM (e.g., 2025-03)
  if (!acc[monthKey]) acc[monthKey] = [];
  acc[monthKey].push(log.energy);
  return acc;
}, {});

// ✅ Calculate monthly averages
const monthlyAveragesData = Object.keys(groupedByMonth).map((month) => ({
  month,
  avgEnergy:
    groupedByMonth[month].reduce((sum, energy) => sum + energy, 0) /
    groupedByMonth[month].length,
}));

console.log("📊 Monthly Energy Averages Data:", monthlyAveragesData);
setMonthlyAverages(monthlyAveragesData);


  
      // ✅ Define emotion categories explicitly to avoid misclassification
const emotionCategories = {
  positive: ["Joy", "Gratitude", "Love", "Pride", "Excitement", "Relief", "Contentment", "Hope", "Amusement", "Confidence"],
  negative: ["Anger", "Frustration", "Fear", "Sadness", "Guilt", "Shame", "Loneliness", "Disgust", "Jealousy", "Regret", "Anxious"]
};

      // ✅ Emotion-HRV correlation logic (Ensures HRV Data is available)
      const emotionHRVScores = {};
  
      logsArray.forEach((log) => {
        const logDate = log.timestamp.toISOString().split('T')[0]; 
        const HRVentry = HRVData.find(entry => entry.date === logDate);
        const HRVvalue = HRVentry ? HRVentry.HRV : null;
  
        if (HRVvalue && log.emotions && Array.isArray(log.emotions)) {
          log.emotions.forEach((emotion) => {
            if (!emotionHRVScores[emotion]) {
              emotionHRVScores[emotion] = { totalHRV: 0, count: 0 };
            }
            emotionHRVScores[emotion].totalHRV += HRVvalue;
            emotionHRVScores[emotion].count += 1;
          });
        }
      });
  

// ✅ Compute average HRV per emotion (Ensures unique HRV values)
// Compute average HRV per emotion with distributed HRV for logs with multiple emotions
const emotionHRVCorrelationData = Object.keys(emotionHRVScores).map((emotion) => {
  // Find all HRV values linked to this emotion
  const relatedHRVs = logsArray.flatMap((log) => {
    // If this log does not contain our current emotion, skip it
    if (!log.emotions || !log.emotions.includes(emotion)) {
      return [];
    }

    // Match the log date to the HRV date
    const logDate = log.timestamp.toISOString().split("T")[0];
    const HRVentry = HRVData.find((entry) => entry.date === logDate);

    // If no matching HRV entry, return empty
    if (!HRVentry) {
      return [];
    }

    // Distribute HRV among all emotions in the same log
    const emotionCount = log.emotions.length || 1;
    const distributedHRV = HRVentry.HRV / emotionCount;

    return [distributedHRV];
  });

  // Calculate the average HRV for this emotion
  let avgHRV = 0;
  if (relatedHRVs.length > 0) {
    avgHRV = relatedHRVs.reduce((sum, hrv) => sum + hrv, 0) / relatedHRVs.length;
  }

  console.log(
    `🎯 Corrected Unique HRV for Emotion: ${emotion} → Avg HRV: ${avgHRV.toFixed(1)}`
  );

  return {
    emotion,
    averageHRV: parseFloat(avgHRV.toFixed(1)),
  };
});

console.log("📊 Corrected Unique Emotion HRV Correlation Data:", emotionHRVCorrelationData);


// ✅ Final log to confirm changes
console.log("📊 Corrected Unique Emotion HRV Correlation Data:", emotionHRVCorrelationData);


// ✅ Final Log to Confirm All Emotions Have Unique Values
console.log("📊 Final Emotion HRV Correlation Data:", emotionHRVCorrelationData);
      
  
      const formattedEmotionData = emotionHRVCorrelationData.map((entry) => ({
        name: entry.emotion,
        value: entry.averageHRV,
      }));
      
      if (emotionHRVCorrelationData && Array.isArray(emotionHRVCorrelationData)) {
        console.log("📊 Raw Emotion HRV Correlation Data:", emotionHRVCorrelationData);
      
        const formattedEmotionData = emotionHRVCorrelationData.map((entry) => ({
          name: entry.emotion,
          value: entry.averageHRV,
        }));
      
        console.log("📊 FORMATTED Emotion Frequency Data:", formattedEmotionData);
      
        setEmotionHRVCorrelation(formattedEmotionData);
      } else {
        console.error("❌ Error: emotionHRVCorrelationData is undefined or not an array.");
      }
      
      
      
      
      // ✅ Generate Smart Insights
      const positiveThreshold = 70; 
      const negativeThreshold = 55; 
      
      // ✅ Corrected categorization of emotions based on HRV
      const positiveEmotions = [];
      const negativeEmotions = [];
      
      emotionHRVCorrelationData.forEach(entry => {
        if (entry.averageHRV >= positiveThreshold && emotionCategories.positive.includes(entry.emotion)) {
          positiveEmotions.push(entry.emotion);
        } else if (entry.averageHRV <= negativeThreshold && emotionCategories.negative.includes(entry.emotion)) {
          negativeEmotions.push(entry.emotion);
        }
      });
      
      
      // ✅ Ensures that emotions in the neutral range (between thresholds) are completely excluded
      
      
  
      const insightsList = [];

      if (positiveEmotions.length > 0) {
        insightsList.push(`✅ Positive Emotions (${positiveEmotions.join(", ")}) correlate with significantly higher HRV.`);
      }
      
      if (negativeEmotions.length > 0) {
        insightsList.push(`⚠️ Negative Emotions (${negativeEmotions.join(", ")}) consistently lower your HRV.`);
      }
      
      // ✅ Ensure insights exclude neutral emotions and only display results when valid
      if (positiveEmotions.length === 0 && negativeEmotions.length === 0) {
        insightsList.push("ℹ️ No strong correlation detected. Keep tracking for better insights.");
      }
      
      setInsights(insightsList);
      console.log("📊 FINAL Smart Insights State:", insightsList);
      
      

      
        
      
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    }
  }, [HRVData]);  // ✅ Added HRVData as a dependency
   // Empty dependency array; add dependencies if needed

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
  }, [fetchLogs]);
   
  
  

  // ✅ Simulate and load HRV data when the component first mounts
  useEffect(() => {
    const data = simulateHRV({
      days: 30,            
      baseHRV: 65,         
      variability: 10,      
      trend: 'declining',  // ✅ changed clearly to declining
    });
  
    setHRVData(data);
    console.log("✅ Simulated HRV Data (Declining) Loaded:", data);
  }, []);
  


// ✅ Logs currentEnergy updates to console
useEffect(() => {
  console.log("⚡ Current Energy:", currentEnergy);
}, [currentEnergy]);  // ✅ Logs every time currentEnergy updates


  // ✅ Add this function BEFORE fetchLogs
  const calculateEnergyDecay = (startEnergy, sleepDebt, fatigueLoad, todaysHRV = 65) => {
    const now = new Date();
    const wakeUpTime = new Date();
    wakeUpTime.setHours(7, 0, 0, 0);
    const hoursAwake = Math.max(0, (now - wakeUpTime) / (1000 * 60 * 60));
  
    let decayRate = 0.5;
    
    // ✅ Sleep Debt: Higher impact on decay
    decayRate += (sleepDebt / 2) * 0.15; // Increased effect
    
    // ✅ HRV Influence: Better regulation of fatigue
    if (todaysHRV >= 75) {
      decayRate *= 0.7; // Higher HRV improves energy retention
    } else if (todaysHRV < 50) {
      decayRate *= 1.3; // Lower HRV accelerates fatigue decay
    }
  
    // ✅ Fatigue Modifier: Increasing fatigue causes greater exhaustion
    if (fatigueLoad > 10) {
      decayRate *= 1.2; // Severe fatigue increases decay significantly
    } else if (fatigueLoad > 5) {
      decayRate *= 1.1; // Mild fatigue slightly increases decay
    }
  
    // ✅ Adjusted Energy: Non-linear reduction
    let adjustedEnergy = startEnergy - (fatigueLoad * 0.15); // Reduced fatigue penalty
    const decayedEnergy = Math.max(0, adjustedEnergy - (hoursAwake * decayRate));
  
    console.log("✅ Energy decay adjusted with fatigue modeling:", {
      startEnergy,
      sleepDebt,
      fatigueLoad,
      todaysHRV,
      decayRate,
      decayedEnergy,
    });
  
    setCurrentEnergy(decayedEnergy);
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
  
      // ✅ Sleep Debt Calculation: Sleep surplus helps recovery
      let newDeficit = sleepHours < 8 ? previousDeficit + (8 - sleepHours) : Math.max(0, previousDeficit - (sleepHours - 8) * 0.8);
  
      // ✅ Adjusted Fatigue Load Calculation
      let fatigueIncreaseFactor = newDeficit > 10 ? 0.25 : 0.1; // Severe debt increases fatigue faster
      let fatigueRecoveryFactor = sleepHours > 8 ? 0.4 : 0.2; // Extra sleep speeds up recovery
  
      // ✅ If sleep debt is growing, fatigue load should increase
      let newFatigueLoad;
      if (newDeficit > previousDeficit) {
        newFatigueLoad = previousFatigue + (newDeficit * fatigueIncreaseFactor);
      } else {
        // ✅ If sleep hours are sufficient, allow gradual fatigue recovery
        newFatigueLoad = Math.max(0, previousFatigue - (sleepHours * fatigueRecoveryFactor));
      }
  
      // ✅ Cap Fatigue Load so it doesn't exceed extreme exhaustion
      newFatigueLoad = Math.min(20, newFatigueLoad);
  
      // ✅ Set starting energy based on fatigue effects
      let startEnergy = Math.max(3, 8 - (newFatigueLoad * 0.8)); // Fatigue lowers starting energy
  
      await setDoc(sleepRef, {
        sleep_hours: sleepHours,
        start_energy: startEnergy,
        deficit: newDeficit,
        fatigueLoad: newFatigueLoad,
      });
  
      console.log("✅ Optimized Sleep Data Saved:", { sleepHours, startEnergy, newDeficit, newFatigueLoad });
  
      setDeficit(newDeficit);
      setFatigueLoad(newFatigueLoad);
    } catch (error) {
      console.error("❌ Error saving sleep data:", error);
    }
  };
  
  const handleSubmit = async (formData) => {
    if (!user) {
      console.error("❌ No authenticated user. Cannot log energy.");
      return;
    }
  
    setLoading(true);
    try {
      const logRef = collection(db, "users", user.uid, "energy_logs");
      await addDoc(logRef, {
        ...formData,
        timestamp: serverTimestamp(),
      });
  
      console.log("✅ Energy log successfully added:", formData);
      fetchLogs(user.uid);  // Refresh logs after submission
    } catch (error) {
      console.error("❌ Error saving log:", error);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        {editingLogId ? "Edit Your Energy Log" : "Log Your Energy"}
      </h2>

      {/* ✅ Input Form */}
      <EnergyForm
  initialEnergy={energy}
  initialSituation={situation}
  initialTrigger={trigger}
  initialEmotions={emotions}
  initialSleepHours={sleepHours}
  loading={loading}
  onSubmit={async (formData) => {
    if (!user) return console.error("❌ User not authenticated");
  
    if (loading) {
      console.warn("⚠️ Submission blocked: Already processing.");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("🚀 Checking for existing logs before writing...");
  
      const userId = user.uid;
      const today = new Date().toISOString().split("T")[0];
      const logsRef = collection(db, "users", userId, "daily_energy", today, "logs");
  
      // ✅ Stronger Duplicate Prevention (Check last 10 seconds)
      const existingLogs = await getDocs(logsRef);
      const duplicateExists = existingLogs.docs.some((doc) => {
        const data = doc.data();
        return (
          data.energy === formData.energy &&
          data.primary_emotion === formData.primary_emotion &&
          data.secondary_emotion === formData.secondary_emotion &&
          data.situation === formData.situation &&
          data.trigger === formData.trigger &&
          data.sleepHours === formData.sleepHours &&
          Math.abs(new Date(data.timestamp?.seconds * 1000) - new Date()) < 10000
        );
      });
  
      if (duplicateExists) {
        console.warn("⚠️ Duplicate log detected. Skipping submission.");
        return;
      }
  
      console.log("✍ Writing new log to Firebase...");
      await addDoc(logsRef, {
        ...formData,
        timestamp: serverTimestamp(),
      });
  
      console.log("✅ Energy Log Successfully Saved:", formData);
      fetchLogs(userId);
    } catch (error) {
      console.error("❌ Error saving energy log:", error);
    } finally {
      setLoading(false);
    }
  }}
  
  
  
  
/>


{/* ✅ This is where the old Sleeptracking block was before SleepTracking.js */}
<SleepTracking deficit={deficit} fatigueLoad={fatigueLoad} />

{/* ✅ ChartSection moved to external file */}
<ChartsSection
  logs={logs}
  energyAverages={energyAverages}
  weeklyAverages={weeklyAverages}
  monthlyAverages={monthlyAverages}
  HRVData={HRVData}
  dayInsights={dayInsights}
  emotionHRVCorrelation={emotionHRVCorrelation}
  insights={insights}
/>

{/* Display Insights using the new component */}
<SmartInsightsCarousel dayInsights={dayInsights} insights={insights} />

{/* Navigation Link to Logs Page */}
<div className="mt-6 text-center">
<Link
    href="/logs"
    style={{
      display: "block",
      width: "100%",
      padding: "10px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",
      marginTop: "10px",
      textDecoration: "none",
    }}
  >
    View All Logged Entries
  </Link>

</div>


      {/* ✅ Logs Table with Edit & Delete Buttons - moved to /logs/page.js */}
      

    </div> 
  );
}
