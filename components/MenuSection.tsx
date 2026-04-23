"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/types";

type Props = {
  period: string;
  stations: Record<string, MenuItem[]>;
  onAdd: (itemId: string) => Promise<void>;
};

export default function MenuSection({ period, stations, onAdd }: Props) {
  const [open, setOpen] = useState(true);
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
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <h3 className="font-semibold text-gray-900">{period}</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {Object.entries(stations).map(([station, items]) => (
            <div key={station}>
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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

function MenuItemRow({
  item,
  loading,
  onAdd,
}: {
  item: MenuItem;
  loading: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.servingSize && <span>{item.servingSize} · </span>}
          {item.calories != null ? (
            <span className="text-orange-500 font-medium">{item.calories} kcal</span>
          ) : (
            <span className="italic">No nutrition data</span>
          )}
          {item.protein != null && (
            <span className="text-blue-500 ml-1">· {item.protein}g P</span>
          )}
          {item.carbs != null && (
            <span className="text-yellow-500 ml-1">· {item.carbs}g C</span>
          )}
          {item.fat != null && (
            <span className="text-green-500 ml-1">· {item.fat}g F</span>
          )}
        </p>
      </div>
      <button
        onClick={onAdd}
        disabled={loading}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        aria-label={`Add ${item.name}`}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
}
