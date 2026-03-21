import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Article, ArticlePage, FeedSource} from '../models/article.model';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class ArticleService {

  private readonly baseUrl = environment.apiUrl + '/it-news';

  constructor(private http: HttpClient) {
  }

  getArticles(page = 0, size = 20, category?: string, source?: string, includeRead = false): Observable<ArticlePage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('includeRead', includeRead.toString());
    if (category) {
      params = params.set('category', category);
    }
    if (source) {
      params = params.set('source', source);
    }
    return this.http.get<ArticlePage>(`${this.baseUrl}/articles`, {params});
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/articles/${id}/read`, null);
  }

  getSources(): Observable<FeedSource[]> {
    return this.http.get<FeedSource[]>(`${this.baseUrl}/sources`);
  }

  triggerFetch(): Observable<string> {
    return this.http.post(`${this.baseUrl}/fetch`, null, {responseType: 'text'});
  }

}
