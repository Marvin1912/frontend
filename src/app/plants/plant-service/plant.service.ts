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

  createPlant(plant: Plant, image: File | null): Observable<HttpResponse<any>> {

    const formData = new FormData();
    formData.append('plant', new Blob([JSON.stringify(plant)], {type: 'application/json'}))

    if (image != null) {
      formData.append('image', image);
    }

    return this.http.post<any>(`${this.host}/plants`, formData, {observe: 'response'});
  }

  uploadImage(id: number, file: File): Observable<HttpResponse<any>> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<any>(`${this.host}/plants/${id}/image`, formData, {observe: 'response'});
  }

  deletePlant(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.host}/plants/${id}`, {observe: 'response'})
  }

}
