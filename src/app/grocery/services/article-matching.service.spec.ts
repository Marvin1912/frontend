import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ArticleMatchingService } from './article-matching.service';
import { ArticleGroupSuggestion, MatchingRunResult } from '../models/article-matching.model';
import { Article } from '../models/article-group.model';
import { environment } from '../../../environments/environment';

describe('ArticleMatchingService', () => {
  let service: ArticleMatchingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ArticleMatchingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a GET request to /articles/matching/suggestions and return the response', () => {
    const mockResponse: ArticleGroupSuggestion[] = [{
      id: 1,
      articleId: 10,
      articleName: 'Milch',
      articleNormalizedName: 'milch',
      suggestedGroupId: 5,
      suggestedGroupName: 'Milchprodukte',
      score: 0.92,
      source: 'HEURISTIC'
    }];

    service.listSuggestions().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/articles/matching/suggestions`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should send a POST request to accept a suggestion and return the updated article', () => {
    const mockResponse: Article = {
      id: 10,
      name: 'Milch',
      normalizedName: 'milch',
      groupId: 5,
      groupName: 'Milchprodukte',
      purchaseCount: 3
    };

    service.acceptSuggestion(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/articles/matching/suggestions/1/accept`);
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });

  it('should send a POST request to reject a suggestion', () => {
    service.rejectSuggestion(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/articles/matching/suggestions/1/reject`);
    expect(req.request.method).toBe('POST');

    req.flush(null);
  });

  it('should send a POST request to run heuristic matching and return the summary', () => {
    const mockResponse: MatchingRunResult = {
      candidatesEvaluated: 20,
      autoAssigned: 5,
      suggested: 8,
      unmatched: 7
    };

    service.runHeuristicMatching().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/articles/matching/run`);
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });

  it('should send a POST request to run LLM matching and return the summary', () => {
    const mockResponse: MatchingRunResult = {
      candidatesEvaluated: 7,
      autoAssigned: 4,
      suggested: 0,
      unmatched: 3
    };

    service.runLlmMatching().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/articles/matching/llm-run`);
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });
});
