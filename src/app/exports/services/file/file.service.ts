import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FileListResponse, FileItem, FileDeleteResponse } from './file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  host: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listFiles(): Observable<FileListResponse> {
    return this.http.get<FileListResponse>(`${this.host}/files/list`);
  }

  deleteFile(fileId: string): Observable<FileDeleteResponse> {
    return this.http.delete<FileDeleteResponse>(`${this.host}/files/${fileId}`);
  }
}