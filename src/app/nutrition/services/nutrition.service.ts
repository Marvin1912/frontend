import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  DaySummary,
  Food,
  FoodDraft,
  FoodInput,
  MealEntry,
  MealEntryInput,
  MealEntryUpdate,
  MealEstimate,
  Profile,
  ProfileInput,
  Targets,
  WeightEntry,
  WeightEntryInput
} from '../models/nutrition.model';

/**
 * HTTP access for the nutrition / calorie tracker feature.
 *
 * Endpoints mirror the backend `nutrition` module. Profile, weight log and
 * targets are wired up; the food catalog, meal logging and day summary
 * endpoints are fleshed out by the follow-up issues.
 */
@Injectable({
  providedIn: 'root'
})
export class NutritionService {

  private host = `${environment.apiUrl}/nutrition`;

  private http = inject(HttpClient);

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.host}/profile`);
  }

  updateProfile(profile: ProfileInput): Observable<Profile> {
    return this.http.put<Profile>(`${this.host}/profile`, profile);
  }

  getTargets(): Observable<Targets> {
    return this.http.get<Targets>(`${this.host}/targets`);
  }

  getWeightEntries(): Observable<WeightEntry[]> {
    return this.http.get<WeightEntry[]>(`${this.host}/weight`);
  }

  addWeightEntry(entry: WeightEntryInput): Observable<WeightEntry> {
    return this.http.post<WeightEntry>(`${this.host}/weight`, entry);
  }

  updateWeightEntry(id: number, entry: WeightEntryInput): Observable<WeightEntry> {
    return this.http.put<WeightEntry>(`${this.host}/weight/${id}`, entry);
  }

  deleteWeightEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/weight/${id}`);
  }

  searchFoods(query: string): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.host}/foods`, {params: {q: query}});
  }

  createFood(food: FoodInput): Observable<Food> {
    return this.http.post<Food>(`${this.host}/foods`, food);
  }

  updateFood(id: string, food: FoodInput): Observable<Food> {
    return this.http.put<Food>(`${this.host}/foods/${id}`, food);
  }

  deleteFood(id: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/foods/${id}`);
  }

  /**
   * Upload a nutrition-label photo for parsing. The image is only used for this
   * request and is not stored; the backend returns a transient draft food.
   */
  scanLabel(file: File): Observable<FoodDraft> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FoodDraft>(`${this.host}/foods/scan-label`, formData);
  }

  /**
   * Look up a packaged food by its EAN/UPC barcode via OpenFoodFacts. Returns a
   * transient draft food (not persisted); the user reviews and saves it. A 404
   * means the barcode is unknown to OpenFoodFacts.
   */
  getFoodByBarcode(ean: string): Observable<FoodDraft> {
    return this.http.get<FoodDraft>(`${this.host}/foods/barcode/${ean}`);
  }

  /** Day summary: logged entries, totals, targets and remaining amounts. */
  getDaySummary(date: string): Observable<DaySummary> {
    return this.http.get<DaySummary>(`${this.host}/days/${date}`);
  }

  /** Day summaries for every date in [from, to] (inclusive), in a single request. */
  getDaySummaries(from: string, to: string): Observable<DaySummary[]> {
    return this.http.get<DaySummary[]>(`${this.host}/days`, {params: {from, to}});
  }

  /** Log a meal entry on a day, either food-based or ad-hoc. */
  addEntry(date: string, entry: MealEntryInput): Observable<MealEntry> {
    return this.http.post<MealEntry>(`${this.host}/days/${date}/entries`, entry);
  }

  /** Edit an entry's portion (food-based) or values (ad-hoc). */
  updateEntry(id: string, update: MealEntryUpdate): Observable<MealEntry> {
    return this.http.put<MealEntry>(`${this.host}/entries/${id}`, update);
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/entries/${id}`);
  }

  /**
   * Estimate macros for a free-text meal description via Claude. An optional
   * portion hint (e.g. "großer Teller", "ca. 350 g") improves accuracy.
   */
  estimateMeal(description: string, portionHint?: string): Observable<MealEstimate> {
    const body: { description: string; portionHint?: string } = {description};
    if (portionHint) {
      body.portionHint = portionHint;
    }
    return this.http.post<MealEstimate>(`${this.host}/estimate`, body);
  }
}
