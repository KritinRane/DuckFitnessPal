// __tests__/calculators.test.ts
import { calculateTDEE, calculateGoalCalories, Sex, ActivityLevel, calculateMacros } from '../lib/calculator';

describe('DuckFitnessPal Calculator Suite', () => {
  
  // Standard Case
  test('Standard TDEE calculation for Stevens student baseline', () => {
    const tdee = calculateTDEE(180, 6, 0, 20, "male", "moderate");
    expect(tdee).toBe(2890);
  });

  // Goal Calories Case
  test('Goal calories correctly applies deficit for aggressive cut', () => {
    const tdee = 3000;
    const calories = calculateGoalCalories(tdee, "cut", "aggressive");
    // 3000 - 750 = 2250
    expect(calories).toBe(2250);
  });

  // --- EDGE CASES ---

  test('Edge Case: Zero weight should return 0 (or handle gracefully)', () => {
    const tdee = calculateTDEE(0, 5, 10, 21, "female", "sedentary");
    expect(tdee).toBe(0);
  });

  test('Edge Case: Negative age should not return a valid TDEE', () => {
    const tdee = calculateTDEE(150, 5, 10, -25, "male", "light");
    expect(tdee).toBe(0);
  });

  test('Edge Case: Carbs should never drop below the physiological floor (50g)', () => {
    // We can test your calculateMacros function here to ensure Math.max(50, ...) works
    const { carbs } = calculateMacros(1200, 250, "cut"); 
    expect(carbs).toBeGreaterThanOrEqual(50);
  });
});