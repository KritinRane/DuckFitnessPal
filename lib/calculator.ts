export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "cut" | "maintain" | "bulk";
export type CutRate = "mild" | "moderate" | "aggressive" | "very_aggressive";
export type BulkRate = "lean" | "moderate";

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  active: "Very Active",
  very_active: "Athlete",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Desk job, little exercise",
  light: "1–3 days/week",
  moderate: "3–5 days/week",
  active: "6–7 days/week",
  very_active: "Twice/day or physical job",
};

export const CUT_RATES: { key: CutRate; label: string; deficit: number; lossPerWeek: string }[] = [
  { key: "mild",           label: "Mild",            deficit: 250,  lossPerWeek: "~0.5 lb/wk" },
  { key: "moderate",       label: "Moderate",        deficit: 500,  lossPerWeek: "~1 lb/wk" },
  { key: "aggressive",     label: "Aggressive",      deficit: 750,  lossPerWeek: "~1.5 lb/wk" },
  { key: "very_aggressive",label: "Very Aggressive", deficit: 1000, lossPerWeek: "~2 lb/wk" },
];

export const BULK_RATES: { key: BulkRate; label: string; surplus: number; gainPerWeek: string }[] = [
  { key: "lean",     label: "Lean Bulk",     surplus: 250, gainPerWeek: "~0.25 lb/wk" },
  { key: "moderate", label: "Moderate Bulk", surplus: 500, gainPerWeek: "~0.5 lb/wk" },
];

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  weightLbs: number,
  heightFt: number,
  heightIn: number,
  age: number,
  sex: Sex,
  activity: ActivityLevel
): number {

  // Guard clause to handle impossible data
  if (weightLbs <= 0 || age <= 0 || (heightFt * 12 + heightIn) <= 0) return 0;

  const weightKg = weightLbs * 0.453592;
  const heightCm = (heightFt * 12 + heightIn) * 2.54;
  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculateGoalCalories(
  tdee: number,
  goal: Goal,
  cutRate: CutRate = "moderate",
  bulkRate: BulkRate = "lean"
): number {
  if (goal === "cut") {
    const rate = CUT_RATES.find((r) => r.key === cutRate)!;
    return tdee - rate.deficit;
  }
  if (goal === "bulk") {
    const rate = BULK_RATES.find((r) => r.key === bulkRate)!;
    return tdee + rate.surplus;
  }
  return tdee;
}

export function calculateMacros(
  calories: number,
  weightLbs: number,
  goal: Goal
): { protein: number; fat: number; carbs: number } {
  const proteinPerLb = goal === "cut" ? 1.0 : goal === "bulk" ? 0.9 : 0.8;
  const protein = Math.round(weightLbs * proteinPerLb);
  const fat = Math.round((calories * 0.25) / 9);
  const carbCals = calories - protein * 4 - fat * 9;
  
  // Logic: Calculate carbs, round it, but force it to stay at or above 50g
  const carbs = Math.max(50, Math.round(carbCals / 4));
  
  return { protein, fat, carbs };
}
