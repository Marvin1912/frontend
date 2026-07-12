import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Article, ArticleGroup} from '../models/article-group.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleGroupService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.host}/articles`);
  }

  createGroup(name: string): Observable<ArticleGroup> {
    return this.http.post<ArticleGroup>(`${this.host}/article-groups`, {name});
  }

  renameGroup(id: number, name: string): Observable<ArticleGroup> {
    return this.http.put<ArticleGroup>(`${this.host}/article-groups/${id}`, {name});
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/article-groups/${id}`);
  }

  assignArticleToGroup(articleId: number, groupId: number): Observable<Article> {
    return this.http.patch<Article>(`${this.host}/articles/${articleId}/group`, {groupId});
  }

  unassignArticle(articleId: number): Observable<Article> {
    return this.http.patch<Article>(`${this.host}/articles/${articleId}/group`, {groupId: null});
  }
}
