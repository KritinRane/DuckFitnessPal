"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/types";

type Props = {
  period: string;
  stations: Record<string, MenuItem[]>;
  onAdd: (itemId: string) => Promise<void>;
  defaultOpen?: boolean;
};

export default function MenuSection({ period, stations, onAdd, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [adding, setAdding] = useState<string | null>(null);

  async function handleAdd(id: string) {
    setAdding(id);
    try {
      await onAdd(id);
    } finally {
      setAdding(null);
    }
  }

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{period}</h3>
        <svg
          className={`w-4 h-4 text-gray-300 dark:text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
          {Object.entries(stations).map(([station, items]) => (
            <div key={station}>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {station}
                </span>
              </div>
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  loading={adding === item.id}
                  onAdd={() => handleAdd(item.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MenuItemRow({ item, loading, onAdd }: { item: MenuItem; loading: boolean; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-black hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.servingSize && <span>{item.servingSize}</span>}
          {item.protein != null && <span> · P {item.protein}g</span>}
          {item.carbs != null && <span> · C {item.carbs}g</span>}
          {item.fat != null && <span> · F {item.fat}g</span>}
        </p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {item.calories != null && (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{item.calories}</span>
        )}
        <button
          onClick={onAdd}
          disabled={loading}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          aria-label={`Add ${item.name}`}
        >
          {loading ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
