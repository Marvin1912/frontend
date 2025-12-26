import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Plant} from '../models/plant.model';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantService {

  host: string = environment.apiUrl

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

    let path: string
    if (image != null) {
      formData.append('image', image);
      const contentType = encodeURIComponent(image.type);
      path = `/plants?content-type=${contentType}`;
    } else {
      path = `/plants`;
    }

    return this.http.post<any>(`${this.host}${path}`, formData, {observe: 'response'});
  }

  updatePlant(plant: Plant): Observable<HttpResponse<any>> {
    return this.http.put<Plant>(`${this.host}/plants`, plant, {observe: 'response'})
  }

  deletePlant(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.host}/plants/${id}`, {observe: 'response'})
  }

  wateredPlant(id: number, lastWatered: string): Observable<Plant> {
    return this.http.patch<any>(`${this.host}/plants/${id}/watered?last-watered=${lastWatered}`, {observe: 'response'})
  }

}
