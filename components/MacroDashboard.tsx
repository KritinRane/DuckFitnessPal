"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DailyTotals, UserGoals } from "@/lib/types";

const R = 70;
const C = 2 * Math.PI * R;

export default function MacroDashboard() {
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const celebrated = useRef(false);

  useEffect(() => {
    async function load() {
      const [logRes, goalsRes] = await Promise.all([fetch("/api/log"), fetch("/api/goals")]);
      const logData = await logRes.json();
      const goalsData = await goalsRes.json();
      setTotals(logData.totals);
      setGoals(goalsData);
    }
    load();
  }, []);

  useEffect(() => {
    if (!goals || celebrated.current) return;
    const allHit =
      goals.protein > 0 && goals.carbs > 0 && goals.fat > 0 &&
      totals.protein >= goals.protein &&
      totals.carbs >= goals.carbs &&
      totals.fat >= goals.fat;
    if (allHit) {
      celebrated.current = true;
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 700);
    }
  }, [totals, goals]);

  if (!goals) {
    return <div className="h-64 rounded-2xl bg-gray-50 dark:bg-gray-900 animate-pulse" />;
  }

  const allGoalsHit =
    goals.protein > 0 && goals.carbs > 0 && goals.fat > 0 &&
    totals.protein >= goals.protein &&
    totals.carbs >= goals.carbs &&
    totals.fat >= goals.fat;

  const pct = goals.calories > 0 ? Math.min(1, totals.calories / goals.calories) : 0;
  const remaining = Math.max(0, goals.calories - Math.round(totals.calories));
  const over = totals.calories > goals.calories;

  const macros = [
    { key: "protein" as const, label: "Protein", barColor: "#3B82F6" },
    { key: "carbs" as const, label: "Carbs", barColor: "#F59E0B" },
    { key: "fat" as const, label: "Fat", barColor: "#10B981" },
  ];

  return (
    <div className={`flex flex-col items-center gap-6 ${celebrating ? "animate-celebrate" : ""}`}>
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle
            cx="90" cy="90" r={R} fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-800"
            strokeWidth="14"
          />
          <circle
            cx="90" cy="90" r={R} fill="none"
            stroke={over ? "#DC2626" : "#E63946"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white leading-none tabular-nums">
            {remaining}
          </span>
          <span className="text-xs text-gray-400 mt-1.5 font-medium tracking-widest uppercase">
            kcal left
          </span>
          <span className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5 tabular-nums">
            {Math.round(totals.calories)} / {goals.calories}
          </span>
        </div>
      </div>

      {allGoalsHit && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-3 font-medium tracking-wide text-center">
          All goals hit — everything else is additional
        </p>
      )}

      <div className="w-full grid grid-cols-3 gap-3">
        {macros.map(({ key, label, barColor }) => {
          const current = totals[key];
          const goal = goals[key];
          const p = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
          const extra = current > goal ? Math.round(current - goal) : null;
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                {Math.round(current)}
              </span>
              <span className="text-[10px] text-gray-400">/ {goal}g</span>
              <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${p}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {label}
              </span>
              {extra !== null && (
                <span className="text-[9px] text-gray-500">+{extra}g</span>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/profile"
        className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
      >
        Edit goals
      </Link>
    </div>
  );
}
