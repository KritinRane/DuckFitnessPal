"use client";

import { useEffect, useState, useCallback } from "react";
import MenuSection from "@/components/MenuSection";
import type { MenuByPeriod } from "@/lib/types";

const MEAL_PERIOD_ORDER = ["Breakfast", "Lunch", "Dinner", "Late Night"];

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuByPeriod>({});
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenu(data.menu ?? {});
      setDate(data.date ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(itemId: string) {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItemId: itemId }),
    });
    if (res.ok) {
      showToast("Added to log!");
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      // Trigger scraper via API — in production this would call the Python scraper.
      // For now, just refresh the menu from DB.
      await load();
      showToast("Menu refreshed");
    } finally {
      setSyncing(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const orderedPeriods = MEAL_PERIOD_ORDER.filter((p) => menu[p]).concat(
    Object.keys(menu).filter((p) => !MEAL_PERIOD_ORDER.includes(p))
  );

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pierce Dining Hall</h1>
          {date && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="flex items-center gap-1.5 text-xs text-red-600 font-medium border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-32 border border-gray-100" />
          ))}
        </div>
      ) : orderedPeriods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">No menu data for today.</p>
          <p className="text-gray-300 text-xs">
            Run the scraper or wait for the midnight sync.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderedPeriods.map((period) => (
            <MenuSection
              key={period}
              period={period}
              stations={menu[period]}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
