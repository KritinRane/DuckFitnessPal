"use client";

import { useEffect, useState, useCallback } from "react";
import FoodLogItem from "@/components/FoodLogItem";
import type { FoodLogEntry, DailyTotals } from "@/lib/types";

export default function LogPage() {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/log");
      const data = await res.json();
      setEntries(data.entries ?? []);
      setTotals(data.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    await fetch(`/api/log/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    // Recalculate totals client-side after deletion
    load();
  }

  async function handleMultiplierChange(id: string, multiplier: number) {
    await fetch(`/api/log/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ multiplier }),
    });
    load();
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Food Log</h1>
        <p className="text-xs text-gray-400 mt-0.5">{today}</p>
      </div>

      {/* Daily totals summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Daily Totals</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <MacroStat label="Calories" value={Math.round(totals.calories)} unit="kcal" color="text-orange-500" />
          <MacroStat label="Protein" value={Math.round(totals.protein)} unit="g" color="text-blue-500" />
          <MacroStat label="Carbs" value={Math.round(totals.carbs)} unit="g" color="text-yellow-500" />
          <MacroStat label="Fat" value={Math.round(totals.fat)} unit="g" color="text-green-500" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-16 border border-gray-100" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">Nothing logged yet today.</p>
          <p className="text-gray-300 text-xs">
            Head to the Menu tab and tap + to add meals.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {entries.map((entry) => (
            <FoodLogItem
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onMultiplierChange={handleMultiplierChange}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function MacroStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-400">{unit}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
