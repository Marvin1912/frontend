import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DaySummary, Food, MealEntry, Profile, Targets, WeightEntry} from '../models/nutrition.model';

/**
 * HTTP access for the nutrition / calorie tracker feature.
 *
 * Endpoints mirror the backend `nutrition` module. Method bodies are kept
 * intentionally thin at the scaffold stage; the follow-up issues
 * (profile/weight/targets, food catalog, meal logging) flesh out the
 * payloads and add the remaining endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class NutritionService {

  private host = `${environment.apiUrl}/nutrition`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.host}/profile`);
  }

  getTargets(): Observable<Targets> {
    return this.http.get<Targets>(`${this.host}/targets`);
  }

  getWeightEntries(): Observable<WeightEntry[]> {
    return this.http.get<WeightEntry[]>(`${this.host}/weight`);
  }

  searchFoods(query: string): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.host}/foods`, {params: {q: query}});
  }

  getMeals(date: string): Observable<MealEntry[]> {
    return this.http.get<MealEntry[]>(`${this.host}/meals`, {params: {date}});
  }

  getDaySummary(date: string): Observable<DaySummary> {
    return this.http.get<DaySummary>(`${this.host}/days/${date}`);
  }
}
