import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EMPTY, Observable, catchError, shareReplay, switchMap, timer} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BitcoinValue, PortfolioValue} from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private host = environment.portfolioApiUrl;
  private http = inject(HttpClient);

  portfolioValue$: Observable<PortfolioValue> = timer(0, 300_000).pipe(
    switchMap(() => this.http.get<PortfolioValue>(`${this.host}/portfolio/value`).pipe(
      catchError(() => EMPTY)
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );

  bitcoinValue$: Observable<BitcoinValue> = timer(0, 300_000).pipe(
    switchMap(() => this.http.get<BitcoinValue>(`${this.host}/portfolio/bitcoin`).pipe(
      catchError(() => EMPTY)
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );
}
