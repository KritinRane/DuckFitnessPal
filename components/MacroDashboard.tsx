"use client";

import { useEffect, useState } from "react";
import MacroBar from "./MacroBar";
import type { DailyTotals, UserGoals } from "@/lib/types";

export default function MacroDashboard() {
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65 });

  useEffect(() => {
    async function load() {
      const [logRes, goalsRes] = await Promise.all([
        fetch("/api/log"),
        fetch("/api/goals"),
      ]);
      const logData = await logRes.json();
      const goalsData = await goalsRes.json();
      setTotals(logData.totals);
      setGoals(goalsData);
      setDraft({
        calories: goalsData.calories,
        protein: goalsData.protein,
        carbs: goalsData.carbs,
        fat: goalsData.fat,
      });
    }
    load();
  }, []);

  async function saveGoals() {
    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const updated = await res.json();
    setGoals(updated);
    setEditMode(false);
  }

  if (!goals) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-2xl" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Macros</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="text-xs text-red-600 font-medium hover:underline"
        >
          {editMode ? "Cancel" : "Edit Goals"}
        </button>
      </div>

      {editMode ? (
        <div className="space-y-3">
          {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-24 text-sm text-gray-600 capitalize">{key}</label>
              <input
                type="number"
                min={0}
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          ))}
          <button
            onClick={saveGoals}
            className="w-full bg-red-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Save Goals
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <MacroBar label="Calories" current={totals.calories} goal={goals.calories} color="bg-orange-400" unit="kcal" />
          <MacroBar label="Protein" current={totals.protein} goal={goals.protein} color="bg-blue-500" />
          <MacroBar label="Carbs" current={totals.carbs} goal={goals.carbs} color="bg-yellow-400" />
          <MacroBar label="Fat" current={totals.fat} goal={goals.fat} color="bg-green-400" />
        </div>
      )}
    </div>
  );
}
