import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  host: string = 'http://localhost:9001'

  constructor(private http: HttpClient) {
  }

  createImage(file: File): Observable<HttpResponse<any>> {

    const formData = new FormData();
    formData.append('image', file);

    const contentType = encodeURIComponent(file.type);

    return this.http.post<any>(`${this.host}/images?content-type=${contentType}`, formData, {observe: 'response'});
  }

  getImage(uuid: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.host}/images/${uuid}`, {observe: 'response'});
  }
}
