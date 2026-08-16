import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Article} from '../models/article-group.model';
import {ArticleGroupSuggestion, MatchingRunResult} from '../models/article-matching.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleMatchingService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listSuggestions(): Observable<ArticleGroupSuggestion[]> {
    return this.http.get<ArticleGroupSuggestion[]>(`${this.host}/articles/matching/suggestions`);
  }

  acceptSuggestion(id: number): Observable<Article> {
    return this.http.post<Article>(`${this.host}/articles/matching/suggestions/${id}/accept`, {});
  }

  rejectSuggestion(id: number): Observable<void> {
    return this.http.post<void>(`${this.host}/articles/matching/suggestions/${id}/reject`, {});
  }

  runHeuristicMatching(): Observable<MatchingRunResult> {
    return this.http.post<MatchingRunResult>(`${this.host}/articles/matching/run`, {});
  }

  runLlmMatching(): Observable<MatchingRunResult> {
    return this.http.post<MatchingRunResult>(`${this.host}/articles/matching/llm-run`, {});
  }
}
