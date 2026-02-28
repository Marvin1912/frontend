import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DictionaryEntry} from '../model/DictionaryEntry';
import {Flashcard} from '../model/Flashcard';
import {Translation} from '../model/Translation';
import {
  DictionaryApiError,
  DictionaryServiceUnavailableError,
  InvalidWordError,
  RateLimitExceededError,
  UnexpectedDictionaryError,
  WordNotFoundError
} from '../model/dictionary-error.model';
import {Deck} from "../model/Deck";

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {

  host: string = environment.apiUrl

  constructor(private http: HttpClient) {
  }

  private handleDictionaryError(error: HttpErrorResponse, word: string): Observable<never> {
    if (error.status === 404) {
      return throwError(() => new WordNotFoundError(word));
    } else if (error.status === 429) {
      return throwError(() => new RateLimitExceededError());
    } else if (error.status === 503) {
      return throwError(() => new DictionaryServiceUnavailableError());
    } else if (error.status === 400) {
      return throwError(() => new InvalidWordError(word));
    } else if (error.status >= 400 && error.status < 500) {
      return throwError(() => new DictionaryApiError(
          `Client error occurred while fetching dictionary entry for word: ${word}`,
          error.status,
          'CLIENT_ERROR'
      ));
    } else if (error.status >= 500) {
      return throwError(() => new DictionaryApiError(
          `Server error occurred while fetching dictionary entry for word: ${word}`,
          error.status,
          'SERVER_ERROR'
      ));
    } else {
      return throwError(() => new UnexpectedDictionaryError(word));
    }
  }

  getWord(word: string): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(`${this.host}/vocabulary/words/${word}`).pipe(
        catchError((error: HttpErrorResponse) => this.handleDictionaryError(error, word))
    );
  }

  getFlashcard(id: number): Observable<Flashcard> {
    return this.http.get<Flashcard>(`${this.host}/vocabulary/flashcards/${id}`);
  }

  updateFlashcard(flashcard: Flashcard): Observable<HttpResponse<void>> {
    return this.http.put<void>(`${this.host}/vocabulary/flashcards`, flashcard, {observe: 'response'});
  }

  getFlashcards(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.host}/vocabulary/flashcards`);
  }

  postFlashcard(flashcard: Flashcard): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.host}/vocabulary/flashcards`, flashcard, {observe: 'response'});
  }

  getTranslation(word: string, context: string): Observable<Translation[]> {
    return this.http.get<Translation[]>(`${this.host}/vocabulary/flashcards/translations?word=${word}&context=${context}`);
  }

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(`${this.host}/vocabulary/decks`);
  }

  updateDeck(deck: Deck): Observable<HttpResponse<Deck>> {
    return this.http.put<Deck>(`${this.host}/vocabulary/decks`, deck, {observe: 'response'});
  }

}
