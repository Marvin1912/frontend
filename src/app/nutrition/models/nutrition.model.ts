// Domain models for the nutrition / calorie tracker feature.
// Fields are intentionally minimal at the scaffold stage and will be
// extended by the follow-up issues (profile/weight/targets, food catalog,
// meal logging, day summary).

export type Sex = 'MALE' | 'FEMALE';

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export type Goal = 'CUT' | 'MAINTAIN' | 'BULK';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

/** Whether the BMR used for the targets came from the manual value or the formula. */
export type TargetBasis = 'MANUAL' | 'FORMULA';

export interface Profile {
  id: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  proteinPerKg: number;
  /** Fat share of target kcal as a fraction, e.g. 0.30 for 30 %. */
  fatPct: number;
  /** Manual basal kcal; when set it overrides the Mifflin–St Jeor formula. */
  basalKcal: number | null;
}

/** Editable profile payload sent on PUT /nutrition/profile (no audit/id fields). */
export type ProfileInput = Omit<Profile, 'id'>;

export interface WeightEntry {
  id: string;
  entryDate: string;
  weightKg: number;
}

/** Create/update payload for a weight entry. */
export interface WeightEntryInput {
  entryDate: string;
  weightKg: number;
}

export interface Targets {
  bmr: number;
  maintenanceKcal: number;
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  basis: TargetBasis;
}

/** Where a food's macro values originated. */
export type FoodSource = 'MANUAL' | 'PHOTO' | 'ESTIMATE' | 'BARCODE';

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  fiberPer100: number | null;
  defaultServingG: number | null;
  source: FoodSource;
}

/** Create/update payload for a food (no audit/id fields). */
export type FoodInput = Omit<Food, 'id'>;

/**
 * Transient food parsed from a nutrition-label photo (POST /nutrition/foods/scan-label).
 * Not persisted — the user reviews it and saves via the food CRUD endpoint.
 * Note the per-serving size is `servingG` here vs `defaultServingG` on a stored food.
 */
export interface FoodDraft {
  name: string;
  brand: string | null;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  fiberPer100: number | null;
  servingG: number | null;
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
