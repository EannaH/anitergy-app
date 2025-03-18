// app/components/EnergyForm.js (example path)
"use client";

import { useState } from "react";

/**
 * Handles ONLY the form for logging energy, triggers, emotions, etc.
 * We'll wire it up so it calls a parent "onSubmit" prop to actually save data.
 */

export default function EnergyForm({
  initialEnergy = 0,
  initialSituation = "",
  initialTrigger = "",
  initialEmotions = [],
  initialSleepHours = 8,
  loading = false,
  onSubmit,   // We'll call this when form is submitted
}) {
  const [energy, setEnergy] = useState(initialEnergy);
  const [situation, setSituation] = useState(initialSituation); // Finalized value
  const [selectedSituation, setSelectedSituation] = useState(initialSituation); // Temporary selection
  const [trigger, setTrigger] = useState(initialTrigger); // Finalized value
  const [selectedTrigger, setSelectedTrigger] = useState(initialTrigger); // Temporary selection
  const [emotions, setEmotions] = useState(initialEmotions); // Used on submission
  const [selectedEmotions, setSelectedEmotions] = useState(initialEmotions); // Used for selecting  
  const [sleepHours, setSleepHours] = useState(initialSleepHours);
  
  // ✅ Modals for selection
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  
  // ✅ Custom input states
  const [customSituation, setCustomSituation] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
  
  // ✅ Determines if the form is complete before allowing submission
const isFormComplete = energy !== null && emotions.length > 0 && (situation || trigger);


// Track submission state to prevent duplicates

const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Ensure state exists

const handleFormSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) {
    console.warn("⚠️ Submission blocked: Already processing.");
    return;
  }

  if (!isFormComplete) {
    console.warn("⚠️ Form incomplete, cannot submit.");
    return;
  }

  setIsSubmitting(true); // ✅ Lock submission immediately

  setEmotions(selectedEmotions); // ✅ Assign selectedEmotions before logging

  const logData = {
    energy,
    situation,
    trigger,
    primary_emotion: selectedEmotions[0] || null,
    secondary_emotion: selectedEmotions[1] || null,
    sleepHours,
    timestamp: new Date().toISOString(),
  };
  

  console.log("✅ Attempting to log energy data:", {
    energy,
    situation,
    trigger,
    emotions,
    primary_emotion: emotions[0] || null,
    secondary_emotion: emotions[1] || null,
    sleepHours,
    timestamp: new Date().toISOString(),
  });
  

  try {
    await onSubmit(logData); // ✅ Ensure Firebase writes before unlocking
    console.log("✅ Submission successful.");
  } catch (error) {
    console.error("❌ Error submitting:", error);
  } finally {
    setTimeout(() => {
      console.log("🔓 Submission lock reset.");
      setIsSubmitting(false);
      setSelectedEmotions((prev) => {
        console.log("🧹 Clearing selected emotions after submission:", prev);
        return [];
      });
      
    }, 5000);
    
  }
};

  

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md"
    >
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

{/* Situation Picker Button */}
<button
  type="button"
  onClick={() => setShowSituationModal(true)}
  className={`w-full p-3 rounded-md mt-2 text-left ${
    situation ? "bg-blue-500 text-white" : "bg-gray-200"
  }`}
>
  {situation ? `📌 ${situation}` : "What Happened?"}
</button>


{/* Trigger Picker Button */}
<button
  type="button"
  onClick={() => setShowTriggerModal(true)}
  className={`w-full p-3 rounded-md mt-2 text-left ${
    trigger ? "bg-blue-500 text-white" : "bg-gray-200"
  }`}
>
  {trigger ? `🎯 ${trigger}` : "What Affected You?"}
</button>


{/* Emotion Picker Button */}
<button
  type="button"
  onClick={() => setShowEmotionModal(true)}
  className="w-full bg-gray-200 p-3 rounded-md mt-2 text-left"
>
  {selectedEmotions.length > 0 ? `😃 ${selectedEmotions.join(", ")}` : "How Did You Feel?"}
</button>


{/* Log Energy Button */}
<button
  type="submit"
  disabled={!isFormComplete || loading}
  className={`w-full p-3 rounded-md text-white ${
    !isFormComplete
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-600"
  }`}
>
  {loading ? "Saving..." : "Log Energy"}
</button>

{/* Subtle Hint for Missing Fields */}
{!isFormComplete && (
  <p className="text-red-500 text-sm mt-2">
    Please select at least one emotion and either a situation or a trigger.
  </p>
)}


      {/* Situation Picker Modal */}
{showSituationModal && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-md w-3/4">
      <h2 className="text-lg font-bold mb-4">Select a Situation</h2>
      {["Work Meeting", "Exercise", "Social Event", "Conflict", "Other"].map((option) => (
        <button
  key={option}
  onClick={() => {
    if (option === "Other") {
      setCustomSituation("");
    } else {
      setSelectedSituation(option);
    }
  }}
  className={`block w-full text-left p-2 border rounded-md mb-2 ${
    selectedSituation === option ? "bg-blue-500 text-white" : ""
  }`}
>
  {option}
</button>

      ))}

      {/* Custom input field */}
      {customSituation !== "" || situation === "Other" ? (
        <input
          type="text"
          placeholder="Type your own situation..."
          className="w-full p-2 border rounded-md"
          value={customSituation}
          onChange={(e) => setCustomSituation(e.target.value)}
          onBlur={() => setSituation(customSituation)}
        />
      ) : null}

<button
  onClick={() => {
    console.log("✅ Finalizing situation:", selectedSituation);
    setSituation(selectedSituation); // Persist selection
    setShowSituationModal(false);
  }}
  className="mt-4 bg-red-500 text-white p-2 rounded-md w-full"
>
  Close
</button>

    </div>
  </div>
)}

{/* Trigger Picker Modal */}
{showTriggerModal && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-md w-3/4">
      <h2 className="text-lg font-bold mb-4">Select a Trigger</h2>
      {["Boss", "Noise", "Overwork", "Relationship", "Other"].map((option) => (
        <button
  key={option}
  onClick={() => {
    if (option === "Other") {
      setCustomTrigger("");
    } else {
      setSelectedTrigger(option);
    }
  }}
  className={`block w-full text-left p-2 border rounded-md mb-2 ${
    selectedTrigger === option ? "bg-blue-500 text-white" : ""
  }`}
>
  {option}
</button>

      ))}

      {/* Custom input field */}
      {customTrigger !== "" || trigger === "Other" ? (
        <input
          type="text"
          placeholder="Type your own trigger..."
          className="w-full p-2 border rounded-md"
          value={customTrigger}
          onChange={(e) => setCustomTrigger(e.target.value)}
          onBlur={() => setTrigger(customTrigger)}
        />
      ) : null}

<button
  onClick={() => {
    console.log("✅ Finalizing trigger:", selectedTrigger);
    setTrigger(selectedTrigger); // Persist selection
    setShowTriggerModal(false);
  }}
  className="mt-4 bg-red-500 text-white p-2 rounded-md w-full"
>
  Close
</button>

    </div>
  </div>
)}

{/* Emotion Picker Modal */}
{showEmotionModal && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-md w-3/4">
      <h2 className="text-lg font-bold mb-4">Select Your Emotions (Max 2)</h2>
      {["Happy", "Stressed", "Anxious", "Excited", "Frustrated", "Content"].map((emotion) => (
        <button
  key={emotion}
  onClick={() => {
    setSelectedEmotions((prev) => {
      const updatedEmotions = prev.includes(emotion)
        ? prev.filter((e) => e !== emotion) // ✅ Remove if already selected
        : prev.length < 2
        ? [...prev, emotion] // ✅ Add if less than 2
        : prev; // ✅ Prevent more than 2 emotions

      console.log("📝 Updated selected emotions (TEMPORARY, not saving yet):", updatedEmotions);
      return updatedEmotions;
    });
  }}
  className={`block w-full text-left p-2 border rounded-md mb-2 ${
    selectedEmotions.includes(emotion) ? "bg-blue-500 text-white" : ""
  }`}
>
  {emotion}
</button>

      ))}

<button
  onClick={() => {
    if (selectedEmotions.length > 0) {
      setEmotions([...selectedEmotions]); // ✅ Copy selection into state
      console.log("✅ Finalized emotions for logging:", selectedEmotions);
    } else {
      console.warn("⚠️ No emotions selected, keeping previous selection.");
    }
    setShowEmotionModal(false);
  }}
  className="mt-4 bg-blue-500 text-white p-2 rounded-md w-full"
>
  Save & Close
</button>



    </div>
  </div>
)}

    </form>
  );
}
