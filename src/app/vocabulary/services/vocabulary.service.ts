import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DictionaryEntry} from '../model/DictionaryEntry';
import {Flashcard} from '../model/Flashcard';
import {Translation} from '../model/Translation';

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {

  host: string = environment.apiUrl

  constructor(private http: HttpClient) {
  }

  getWord(word: string): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(`${this.host}/vocabulary/words/${word}`);
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

}
