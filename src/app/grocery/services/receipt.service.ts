import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Receipt, ReceiptItem} from '../models/receipt.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadReceipt(file: File): Observable<HttpResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.host}/receipts`, formData, {observe: 'response'});
  }

  getReceipts(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(`${this.host}/receipts`);
  }

  getReceiptItems(id: string): Observable<ReceiptItem[]> {
    return this.http.get<ReceiptItem[]>(`${this.host}/receipts/${id}/items`);
  }
}
