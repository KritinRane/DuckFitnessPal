"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
  CUT_RATES,
  BULK_RATES,
  type Sex,
  type ActivityLevel,
  type Goal,
  type CutRate,
  type BulkRate,
} from "@/lib/calculator";

type FormState = {
  weightLbs: string;
  heightFt: string;
  heightIn: string;
  age: string;
  sex: Sex | "";
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  cutRate: CutRate;
  bulkRate: BulkRate;
};

const DEFAULT_FORM: FormState = {
  weightLbs: "",
  heightFt: "",
  heightIn: "0",
  age: "",
  sex: "",
  activityLevel: "",
  goal: "",
  cutRate: "moderate",
  bulkRate: "lean",
};

function deriveTargets(f: FormState) {
  if (
    !f.weightLbs || !f.heightFt || !f.age ||
    !f.sex || !f.activityLevel || !f.goal
  ) return null;

  const tdee = calculateTDEE(
    Number(f.weightLbs),
    Number(f.heightFt),
    Number(f.heightIn),
    Number(f.age),
    f.sex as Sex,
    f.activityLevel as ActivityLevel
  );
  const calories = calculateGoalCalories(
    tdee,
    f.goal as Goal,
    f.cutRate,
    f.bulkRate
  );
  const macros = calculateMacros(calories, Number(f.weightLbs), f.goal as Goal);
  return { tdee, calories, ...macros };
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p) {
          setForm({
            weightLbs:     p.weightLbs     != null ? String(p.weightLbs)     : "",
            heightFt:      p.heightFt      != null ? String(p.heightFt)      : "",
            heightIn:      p.heightIn      != null ? String(p.heightIn)      : "0",
            age:           p.age           != null ? String(p.age)           : "",
            sex:           p.sex           ?? "",
            activityLevel: p.activityLevel ?? "",
            goal:          p.goal          ?? "",
            cutRate:       p.cutRate       ?? "moderate",
            bulkRate:      p.bulkRate      ?? "lean",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleApply() {
    const targets = deriveTargets(form);
    if (!targets) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightLbs:     Number(form.weightLbs),
          heightFt:      Number(form.heightFt),
          heightIn:      Number(form.heightIn),
          age:           Number(form.age),
          sex:           form.sex,
          activityLevel: form.activityLevel,
          goal:          form.goal,
          cutRate:       form.cutRate,
          bulkRate:      form.bulkRate,
        }),
      });
      await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: targets.calories,
          protein:  targets.protein,
          carbs:    targets.carbs,
          fat:      targets.fat,
        }),
      });
      setSaved(true);
      setTimeout(() => router.push("/"), 800);
    } finally {
      setSaving(false);
    }
  }

  const targets = deriveTargets(form);

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-5 pt-10 pb-8">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-5 pt-10 pb-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">We&apos;ll calculate your daily targets</p>
      </div>

      {/* Body stats */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Body Stats</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Weight (lbs)</label>
            <input
              type="number"
              min={50}
              max={500}
              placeholder="170"
              value={form.weightLbs}
              onChange={(e) => set("weightLbs", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Age</label>
            <input
              type="number"
              min={13}
              max={100}
              placeholder="20"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Height</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={3}
                max={8}
                placeholder="5"
                value={form.heightFt}
                onChange={(e) => set("heightFt", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">ft</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                min={0}
                max={11}
                placeholder="10"
                value={form.heightIn}
                onChange={(e) => set("heightIn", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">in</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Sex</label>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                onClick={() => set("sex", s)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  form.sex === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {s === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Activity level */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Activity Level</h2>
        <div className="space-y-2">
          {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => set("activityLevel", level)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                form.activityLevel === level
                  ? "border-red-600 bg-red-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <span className={`text-sm font-medium ${form.activityLevel === level ? "text-red-700" : "text-gray-700"}`}>
                {ACTIVITY_LABELS[level]}
              </span>
              <span className="text-xs text-gray-400">{ACTIVITY_DESCRIPTIONS[level]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Goal */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Goal</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: "cut",      label: "Cut",      sub: "Lose fat",     icon: CutIcon },
              { key: "maintain", label: "Maintain", sub: "Stay lean",    icon: MaintainIcon },
              { key: "bulk",     label: "Bulk",     sub: "Build muscle", icon: BulkIcon },
            ] as const
          ).map(({ key, label, sub, icon: Icon }) => (
            <button
              key={key}
              onClick={() => set("goal", key)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${
                form.goal === key
                  ? "border-red-600 bg-red-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <Icon active={form.goal === key} />
              <span className={`text-sm font-semibold ${form.goal === key ? "text-red-700" : "text-gray-700"}`}>
                {label}
              </span>
              <span className="text-[10px] text-gray-400">{sub}</span>
            </button>
          ))}
        </div>

        {/* Cut rate */}
        {form.goal === "cut" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-gray-400">How aggressive?</p>
            <div className="grid grid-cols-2 gap-2">
              {CUT_RATES.map(({ key, label, deficit, lossPerWeek }) => (
                <button
                  key={key}
                  onClick={() => set("cutRate", key)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    form.cutRate === key
                      ? "border-red-600 bg-red-50"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <span className={`text-sm font-medium ${form.cutRate === key ? "text-red-700" : "text-gray-700"}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    -{deficit} kcal · {lossPerWeek}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bulk rate */}
        {form.goal === "bulk" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-gray-400">How aggressive?</p>
            <div className="grid grid-cols-2 gap-2">
              {BULK_RATES.map(({ key, label, surplus, gainPerWeek }) => (
                <button
                  key={key}
                  onClick={() => set("bulkRate", key)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    form.bulkRate === key
                      ? "border-red-600 bg-red-50"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <span className={`text-sm font-medium ${form.bulkRate === key ? "text-red-700" : "text-gray-700"}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    +{surplus} kcal · {gainPerWeek}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Preview */}
      {targets && (
        <section className="bg-gray-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Your targets</p>
              <p className="text-3xl font-bold text-white tabular-nums mt-1">
                {targets.calories.toLocaleString()}
                <span className="text-base font-normal text-gray-400 ml-1">kcal/day</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">TDEE</p>
              <p className="text-sm font-semibold text-gray-400">{targets.tdee.toLocaleString()} kcal</p>
              {form.goal !== "maintain" && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.goal === "cut" ? "−" : "+"}
                  {Math.abs(targets.calories - targets.tdee)} kcal
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-gray-800">
            {[
              { label: "Protein", value: targets.protein, color: "#60A5FA" },
              { label: "Carbs",   value: targets.carbs,   color: "#FBBF24" },
              { label: "Fat",     value: targets.fat,     color: "#34D399" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-white tabular-nums" style={{ color }}>{value}g</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Apply button */}
      <button
        onClick={handleApply}
        disabled={!targets || saving || saved}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 bg-red-600 hover:bg-red-700 text-white"
      >
        {saved ? "Saved! Going home…" : saving ? "Saving…" : "Apply Goals"}
      </button>
    </main>
  );
}

function CutIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-red-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function MaintainIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-red-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function BulkIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-red-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}
