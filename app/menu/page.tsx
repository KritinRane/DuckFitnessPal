"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MenuSection from "@/components/MenuSection";
import { useDarkMode } from "@/components/DarkModeProvider";
import type { DailyTotals, MenuByPeriod, UserGoals } from "@/lib/types";

const MEAL_PERIOD_ORDER = ["Breakfast", "Brunch", "Lunch", "Dinner", "Late Night"];

function getCurrentPeriod(): string | null {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    if (mins >= 600 && mins < 930) return "Brunch";
    if (mins >= 990 && mins < 1290) return "Dinner";
  } else {
    if (mins >= 420 && mins < 630) return "Breakfast";
    if (mins >= 690 && mins < 930) return "Lunch";
    if (mins >= 990 && mins < 1290) return "Dinner";
  }
  return null;
}

type ToastType = "default" | "warning" | "celebration";

const MACRO_LABELS: Record<string, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

export default function MenuPage() {
  const { refresh: refreshDarkMode } = useDarkMode();
  const [menu, setMenu] = useState<MenuByPeriod>({});
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>("default");
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [totals, setTotals] = useState<DailyTotals | null>(null);
  const prevTotals = useRef<DailyTotals | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, logRes, goalsRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/log"),
        fetch("/api/goals"),
      ]);
      const menuData = await menuRes.json();
      const logData = await logRes.json();
      const goalsData = await goalsRes.json();
      setMenu(menuData.menu ?? {});
      setDate(menuData.date ?? "");
      setTotals(logData.totals);
      prevTotals.current = logData.totals;
      setGoals(goalsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(itemId: string) {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItemId: itemId }),
    });
    if (!res.ok) return;

    const logRes = await fetch("/api/log");
    const logData = await logRes.json();
    const newTotals: DailyTotals = logData.totals;

    if (goals && prevTotals.current) {
      const macroKeys = ["protein", "carbs", "fat"] as const;
      let msg = "Added to log";
      let type: ToastType = "default";

      for (const key of macroKeys) {
        const prev = prevTotals.current[key];
        const curr = newTotals[key];
        const goal = goals[key];
        if (goal <= 0) continue;

        if (curr >= goal && prev < goal) {
          msg = `${MACRO_LABELS[key]} goal hit! 🎉`;
          type = "celebration";
          break;
        }
        if (curr / goal >= 0.9 && prev / goal < 0.9) {
          msg = `${Math.round(goal - curr)}g ${MACRO_LABELS[key].toLowerCase()} to go`;
          type = "warning";
        }
      }

      showToast(msg, type);
    } else {
      showToast("Added to log", "default");
    }

    setTotals(newTotals);
    prevTotals.current = newTotals;
    await refreshDarkMode();
  }

  function showToast(msg: string, type: ToastType = "default") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 2500);
  }

  const orderedPeriods = MEAL_PERIOD_ORDER.filter((p) => menu[p]).concat(
    Object.keys(menu).filter((p) => !MEAL_PERIOD_ORDER.includes(p))
  );

  const activePeriod = getCurrentPeriod();

  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  const toastStyles: Record<ToastType, string> = {
    default: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
    warning: "bg-amber-500 text-white",
    celebration: "bg-emerald-500 text-white",
  };

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-5 pt-10 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Menu</h1>
        {dateLabel && <p className="text-sm text-gray-400 mt-0.5">{dateLabel} · Pierce Dining</p>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-900 rounded-xl h-28" />
          ))}
        </div>
      ) : orderedPeriods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-300 dark:text-gray-700 text-4xl mb-3">—</p>
          <p className="text-sm font-medium text-gray-400">No menu data for today</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Run the scraper to populate meals</p>
        </div>
      ) : (
        <div className="space-y-1">
          {orderedPeriods.map((period) => (
            <MenuSection
              key={period}
              period={period}
              stations={menu[period]}
              onAdd={handleAdd}
              defaultOpen={period === activePeriod}
            />
          ))}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap ${toastStyles[toastType]}`}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
