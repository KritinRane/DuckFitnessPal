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

  const displayCalories =
    entry.calories != null ? Math.round(entry.calories * entry.multiplier) : null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleMultiplier(m: number) {
    if (m === entry.multiplier) return;
    setChanging(true);
    try {
      await onMultiplierChange(entry.id, m);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{entry.itemName}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => handleMultiplier(m)}
              disabled={changing}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                entry.multiplier === m
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {displayCalories != null && (
            <span className="text-orange-500 font-medium">{displayCalories} kcal</span>
          )}
          {entry.protein != null && (
            <span className="text-blue-500 ml-1">· {Math.round(entry.protein * entry.multiplier)}g P</span>
          )}
          {entry.carbs != null && (
            <span className="text-yellow-500 ml-1">· {Math.round(entry.carbs * entry.multiplier)}g C</span>
          )}
          {entry.fat != null && (
            <span className="text-green-500 ml-1">· {Math.round(entry.fat * entry.multiplier)}g F</span>
          )}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label={`Remove ${entry.itemName}`}
      >
        {deleting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}
