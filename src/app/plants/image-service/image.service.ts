import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  host: string = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  extractUuidFromResponse(response: HttpResponse<any>) {
    const location = response.headers.get('Location');
    return location?.replace('/images/', '');
  }

  createImage(file: File): Observable<HttpResponse<any>> {

    const formData = new FormData();
    formData.append('image', file);

    const contentType = encodeURIComponent(file.type);

    return this.http.post<any>(`${this.host}/images?content-type=${contentType}`, formData, {observe: 'response'});
  }
}
