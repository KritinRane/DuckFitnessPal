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

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    await fetch(`/api/log/${id}`, { method: "DELETE" });
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

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-5 pt-10 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Food Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Calories", value: Math.round(totals.calories), unit: "kcal" },
          { label: "Protein", value: Math.round(totals.protein), unit: "g" },
          { label: "Carbs", value: Math.round(totals.carbs), unit: "g" },
          { label: "Fat", value: Math.round(totals.fat), unit: "g" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">{value}</p>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{unit}</p>
            <p className="text-[9px] text-gray-300 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-16" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-300 text-4xl mb-3">—</p>
          <p className="text-sm font-medium text-gray-400">Nothing logged yet</p>
          <p className="text-xs text-gray-300 mt-1">Go to Menu and tap + to add meals</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
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
