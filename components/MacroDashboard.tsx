"use client";

import { useEffect, useState } from "react";
import type { DailyTotals, UserGoals } from "@/lib/types";

const R = 70;
const C = 2 * Math.PI * R;

export default function MacroDashboard() {
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65 });

  useEffect(() => {
    async function load() {
      const [logRes, goalsRes] = await Promise.all([fetch("/api/log"), fetch("/api/goals")]);
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
    return <div className="h-64 rounded-2xl bg-gray-50 animate-pulse" />;
  }

  const pct = goals.calories > 0 ? Math.min(1, totals.calories / goals.calories) : 0;
  const remaining = Math.max(0, goals.calories - Math.round(totals.calories));
  const over = totals.calories > goals.calories;

  const macros = [
    { key: "protein" as const, label: "Protein", barColor: "#3B82F6" },
    { key: "carbs" as const, label: "Carbs", barColor: "#F59E0B" },
    { key: "fat" as const, label: "Fat", barColor: "#10B981" },
  ];

  if (editMode) {
    return (
      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Daily Goals</span>
          <button onClick={() => setEditMode(false)} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <label className="w-20 text-sm text-gray-500 capitalize">{key}</label>
            <input
              type="number"
              min={0}
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
              className="flex-1 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
        <button
          onClick={saveGoals}
          className="w-full bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Save Goals
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Calorie ring */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle cx="90" cy="90" r={R} fill="none" stroke="#F3F3F3" strokeWidth="14" />
          <circle
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={over ? "#DC2626" : "#E63946"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 leading-none tabular-nums">
            {remaining}
          </span>
          <span className="text-xs text-gray-400 mt-1.5 font-medium tracking-widest uppercase">
            kcal left
          </span>
          <span className="text-[11px] text-gray-300 mt-0.5 tabular-nums">
            {Math.round(totals.calories)} / {goals.calories}
          </span>
        </div>
      </div>

      {/* Macro stats */}
      <div className="w-full grid grid-cols-3 gap-3">
        {macros.map(({ key, label, barColor }) => {
          const current = totals[key];
          const goal = goals[key];
          const p = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gray-900 tabular-nums leading-none">
                {Math.round(current)}
              </span>
              <span className="text-[10px] text-gray-400">/ {goal}g</span>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${p}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setEditMode(true)}
        className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
      >
        Edit goals
      </button>
    </div>
  );
}
