"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Ctx = { dark: boolean; refresh: () => Promise<void> };
const DarkModeContext = createContext<Ctx>({ dark: false, refresh: async () => {} });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [logRes, goalsRes] = await Promise.all([fetch("/api/log"), fetch("/api/goals")]);
      const { totals } = await logRes.json();
      const goals = await goalsRes.json();
      const allHit =
        goals.protein > 0 && goals.carbs > 0 && goals.fat > 0 &&
        totals.protein >= goals.protein &&
        totals.carbs >= goals.carbs &&
        totals.fat >= goals.fat;
      setDark(allHit);
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, refresh }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
