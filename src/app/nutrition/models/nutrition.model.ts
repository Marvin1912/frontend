// Domain models for the nutrition / calorie tracker feature.
// Fields are intentionally minimal at the scaffold stage and will be
// extended by the follow-up issues (profile/weight/targets, food catalog,
// meal logging, day summary).

export type Sex = 'MALE' | 'FEMALE';

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export type Goal = 'CUT' | 'MAINTAIN' | 'BULK';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

/**
 * Whether the BMR used for the targets came from a manual basal value
 * (`BASAL_KCAL`) or the Mifflin–St Jeor formula (`MIFFLIN_ST_JEOR`).
 */
export type TargetBasis = 'BASAL_KCAL' | 'MIFFLIN_ST_JEOR';

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

/** A set of macro values (used for day totals and remaining-vs-target). */
export interface Macros {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * A logged meal entry. Either references a stored food (`foodId` + `quantityG`)
 * or is ad-hoc (`description` + supplied macros, e.g. a canteen estimate). The
 * macro values are snapshotted at log time so historical totals stay stable.
 */
export interface MealEntry {
  id: string;
  entryDate: string;
  mealType: MealType;
  foodId: string | null;
  /** Name of the referenced food, when the backend resolves it for display. */
  foodName: string | null;
  /** Free-text label for ad-hoc entries (null for food-based entries). */
  description: string | null;
  /** Portion in grams for food-based entries (null for ad-hoc). */
  quantityG: number | null;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Log a stored food eaten in a given portion (POST /days/{date}/entries). */
export interface FoodEntryInput {
  mealType: MealType;
  foodId: string;
  quantityG: number;
}

/** Log an ad-hoc entry with supplied macros, e.g. a canteen estimate. */
export interface AdHocEntryInput {
  mealType: MealType;
  description: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type MealEntryInput = FoodEntryInput | AdHocEntryInput;

/** Edit payload for PUT /entries/{id}: a new portion, or new ad-hoc values. */
export type MealEntryUpdate =
  | { quantityG: number }
  | { description: string; kcal: number; proteinG: number; carbsG: number; fatG: number };

export interface DaySummary {
  date: string;
  entries: MealEntry[];
  totals: Macros;
  /** Null when no profile/weight exists yet (backend returns 200 with null). */
  targets: Targets | null;
  /** Null when no profile/weight exists yet (backend returns 200 with null). */
  remaining: Macros | null;
}

/**
 * Rough macro estimate for a free-text meal description, produced by Claude
 * (POST /nutrition/estimate). Directly usable as an ad-hoc entry payload.
 */
export interface MealEstimate {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Short note on the assumptions made (portion size, ingredients, …). */
  assumptions: string;
}
