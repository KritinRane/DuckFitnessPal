export type Macros = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export type MenuItem = Macros & {
  id: string;
  date: string;
  mealPeriod: string;
  station: string;
  name: string;
  servingSize: string | null;
};

export type FoodLogEntry = Macros & {
  id: string;
  date: string;
  menuItemId: string | null;
  itemName: string;
  servingSize: string | null;
  multiplier: number;
  loggedAt: string;
};

export type UserGoals = {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MenuByPeriod = Record<string, Record<string, MenuItem[]>>;
