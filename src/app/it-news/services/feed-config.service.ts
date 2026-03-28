import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FeedSource} from '../models/article.model';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class FeedConfigService {

  private readonly baseUrl = environment.apiUrl + '/it-news/feeds';

  constructor(private http: HttpClient) {
  }

  getFeeds(activeOnly = false): Observable<FeedSource[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<FeedSource[]>(`${this.baseUrl}/`, {params});
  }

  createFeed(feed: FeedSource): Observable<FeedSource> {
    return this.http.post<FeedSource>(`${this.baseUrl}/`, feed);
  }

  updateFeed(feed: FeedSource): Observable<FeedSource> {
    return this.http.put<FeedSource>(`${this.baseUrl}/${feed.id}`, feed);
  }

  deleteFeed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
