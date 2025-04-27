import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Plant} from '../model/plant';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlantService {

  host: string = 'http://localhost:9001'

  constructor(private http: HttpClient) {
  }

  getPlant(id: number): Observable<Plant> {
    return this.http.get<Plant>(`${this.host}/plants/${id}`);
  }

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.host}/plants`);
  }

  createPlant(plant: Plant): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.host}/plants`, plant, {observe: 'response'});
  }

  uploadImage(id: number, file: File): Observable<HttpResponse<any>> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<any>(`${this.host}/plants/${id}/image`, formData, {observe: 'response'});
  }

}
