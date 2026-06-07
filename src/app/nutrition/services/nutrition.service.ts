import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  DaySummary,
  Food,
  MealEntry,
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

  updateWeightEntry(id: string, entry: WeightEntryInput): Observable<WeightEntry> {
    return this.http.put<WeightEntry>(`${this.host}/weight/${id}`, entry);
  }

  deleteWeightEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/weight/${id}`);
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
