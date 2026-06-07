import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Receipt, ReceiptItem, Supermarket} from '../models/receipt.model';

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

  deleteReceipt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/receipts/${id}`);
  }

  updateReceiptItem(receiptId: string, item: ReceiptItem): Observable<ReceiptItem> {
    return this.http.put<ReceiptItem>(
      `${this.host}/receipts/${receiptId}/items/${item.id}`,
      {name: item.name, quantity: item.quantity, singlePrice: item.singlePrice}
    );
  }

  addReceiptItem(receiptId: string, item: {name: string; quantity: number; singlePrice: number}): Observable<ReceiptItem> {
    return this.http.post<ReceiptItem>(`${this.host}/receipts/${receiptId}/items`, item);
  }

  updateSupermarket(id: string, supermarket: Supermarket): Observable<Receipt> {
    return this.http.patch<Receipt>(`${this.host}/receipts/${id}/supermarket`, {supermarket});
  }
}
