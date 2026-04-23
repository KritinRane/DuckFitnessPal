"use client";

import { useEffect, useState, useCallback } from "react";
import MenuSection from "@/components/MenuSection";
import type { MenuByPeriod } from "@/lib/types";

const MEAL_PERIOD_ORDER = ["Breakfast", "Lunch", "Dinner", "Late Night"];

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuByPeriod>({});
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
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
    if (res.ok) showToast("Added to log");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const orderedPeriods = MEAL_PERIOD_ORDER.filter((p) => menu[p]).concat(
    Object.keys(menu).filter((p) => !MEAL_PERIOD_ORDER.includes(p))
  );

  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-5 pt-10 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Menu</h1>
        {dateLabel && <p className="text-sm text-gray-400 mt-0.5">{dateLabel} · Pierce Dining</p>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-28" />
          ))}
        </div>
      ) : orderedPeriods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-300 text-4xl mb-3">—</p>
          <p className="text-sm font-medium text-gray-400">No menu data for today</p>
          <p className="text-xs text-gray-300 mt-1">Run the scraper to populate meals</p>
        </div>
      ) : (
        <div className="space-y-1">
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

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
