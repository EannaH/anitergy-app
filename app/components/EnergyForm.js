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
  const [situation, setSituation] = useState(initialSituation);
  const [trigger, setTrigger] = useState(initialTrigger);
  const [emotions, setEmotions] = useState(initialEmotions);
  const [sleepHours, setSleepHours] = useState(initialSleepHours);

  // Handle the actual form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Send form data to the parent
    onSubmit({
      energy,
      situation,
      trigger,
      emotions,
      sleepHours,
    });

    // Optionally, you could reset local state here if you want
    // setEnergy(0);
    // setSituation("");
    // setTrigger("");
    // setEmotions([]);
    // setSleepHours(8);
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
            setEmotions(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          {/* ✅ You can keep these same <optgroup> sections */}
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

          <optgroup label="⚡ Energy-Draining Emotions">
            <option value="Anger">Anger – High-energy but emotionally exhausting</option>
            <option value="Frustration">Frustration – A mental drain</option>
            <option value="Fear">Fear – Triggers survival responses</option>
            <option value="Sadness">Sadness – Lowers motivation</option>
            <option value="Guilt">Guilt – Creates a self-punishing cycle</option>
            <option value="Shame">Shame – Depletes self-esteem</option>
            <option value="Loneliness">Loneliness – Causes emotional depletion</option>
            <option value="Disgust">Disgust – Drains energy via aversion</option>
            <option value="Jealousy">Jealousy – Mix of insecurity and resentment</option>
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
        style={{
          padding: '10px',
          backgroundColor: '#4285F4',
          color: 'white',
          borderRadius: '5px'
        }}
        disabled={loading}
      >
        {loading ? "Saving..." : "Log Energy"}
      </button>
    </form>
  );
}
