"use client";

import { useState } from "react";
import type { FoodLogEntry } from "@/lib/types";

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3];

type Props = {
  entry: FoodLogEntry;
  onDelete: (id: string) => Promise<void>;
  onMultiplierChange: (id: string, multiplier: number) => Promise<void>;
};

export default function FoodLogItem({ entry, onDelete, onMultiplierChange }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [changing, setChanging] = useState(false);

  const cal = entry.calories != null ? Math.round(entry.calories * entry.multiplier) : null;
  const pro = entry.protein != null ? Math.round(entry.protein * entry.multiplier) : null;
  const carb = entry.carbs != null ? Math.round(entry.carbs * entry.multiplier) : null;
  const fat = entry.fat != null ? Math.round(entry.fat * entry.multiplier) : null;

  async function handleDelete() {
    setDeleting(true);
    try { await onDelete(entry.id); } finally { setDeleting(false); }
  }

  async function handleMultiplier(m: number) {
    if (m === entry.multiplier) return;
    setChanging(true);
    try { await onMultiplierChange(entry.id, m); } finally { setChanging(false); }
  }

  return (
    <div className="px-4 py-3 bg-white dark:bg-black">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{entry.itemName}</p>
            {cal != null && (
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums shrink-0">{cal}</span>
            )}
          </div>
          {(pro != null || carb != null || fat != null) && (
            <p className="text-xs text-gray-400 mt-0.5">
              {pro != null && <span>P {pro}g</span>}
              {carb != null && <span> · C {carb}g</span>}
              {fat != null && <span> · F {fat}g</span>}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            {MULTIPLIERS.map((m) => (
              <button
                key={m}
                onClick={() => handleMultiplier(m)}
                disabled={changing}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  entry.multiplier === m
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {m}×
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-200 dark:text-gray-700 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={`Remove ${entry.itemName}`}
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
