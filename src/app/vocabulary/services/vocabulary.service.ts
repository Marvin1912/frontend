import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DictionaryEntry} from '../model/DictionaryEntry';
import {Flashcard} from '../model/Flashcard';
import {Translation} from '../model/Translation';
import {
  WordNotFoundError,
  RateLimitExceededError,
  DictionaryServiceUnavailableError,
  InvalidWordError,
  DictionaryApiError,
  UnexpectedDictionaryError,
  DictionaryError
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

  getFlashcardFile(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.host}/vocabulary/flashcards/file`, {observe: 'response', responseType: "blob"});
  }

  getFlashcards(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.host}/vocabulary/flashcards`);
  }

  postFlashcard(flashcard: Flashcard): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.host}/vocabulary/flashcards`, flashcard, {observe: 'response'});
  }

  uploadFlashcardFile(file: File): Observable<HttpResponse<number>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<number>(`${this.host}/vocabulary/flashcards/file`, formData, {observe: 'response'});
  }

  getTranslation(word: string, context: string): Observable<Translation[]> {
    return this.http.get<Translation[]>(`${this.host}/vocabulary/flashcards/translations?word=${word}&context=${context}`);
  }

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(`${this.host}/vocabulary/decks`);
  }

}
