import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArithmeticSession } from '../model/arithmetic-session';
import { ArithmeticSettings } from '../model/arithmetic-settings';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ArithmeticApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSession(settings: ArithmeticSettings): Observable<ArithmeticSession> {
    return this.http.post<ArithmeticSession>(`${this.apiUrl}/sessions`, settings);
  }

  updateSession(session: ArithmeticSession): Observable<ArithmeticSession> {
    return this.http.put<ArithmeticSession>(`${this.apiUrl}/sessions/${session.id}`, session);
  }

  getSessions(): Observable<ArithmeticSession[]> {
    return this.http.get<ArithmeticSession[]>(`${this.apiUrl}/sessions`);
  }

  getSession(id: string): Observable<ArithmeticSession> {
    return this.http.get<ArithmeticSession>(`${this.apiUrl}/sessions/${id}`);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${id}`);
  }

  startSession(id: string): Observable<ArithmeticSession> {
    return this.http.post<ArithmeticSession>(`${this.apiUrl}/sessions/${id}/start`, {});
  }

  pauseSession(id: string): Observable<ArithmeticSession> {
    return this.http.post<ArithmeticSession>(`${this.apiUrl}/sessions/${id}/pause`, {});
  }

  resumeSession(id: string): Observable<ArithmeticSession> {
    return this.http.post<ArithmeticSession>(`${this.apiUrl}/sessions/${id}/resume`, {});
  }

  completeSession(id: string): Observable<ArithmeticSession> {
    return this.http.post<ArithmeticSession>(`${this.apiUrl}/sessions/${id}/complete`, {});
  }

  getSettings(): Observable<ArithmeticSettings> {
    return this.http.get<ArithmeticSettings>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: ArithmeticSettings): Observable<ArithmeticSettings> {
    return this.http.put<ArithmeticSettings>(`${this.apiUrl}/settings`, settings);
  }
}
