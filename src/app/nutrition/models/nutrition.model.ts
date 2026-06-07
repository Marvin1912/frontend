// Domain models for the nutrition / calorie tracker feature.
// Fields are intentionally minimal at the scaffold stage and will be
// extended by the follow-up issues (profile/weight/targets, food catalog,
// meal logging, day summary).

export type Sex = 'MALE' | 'FEMALE';

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export type Goal = 'LOSE' | 'MAINTAIN' | 'GAIN';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Profile {
  id: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface Targets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  foodId: string;
  foodName: string;
  amountG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DaySummary {
  date: string;
  targets: Targets;
  consumedCalories: number;
  consumedProteinG: number;
  consumedCarbsG: number;
  consumedFatG: number;
  meals: MealEntry[];
}
