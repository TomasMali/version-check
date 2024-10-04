import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Release } from './release.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://10.100.0.30:3008';
  //  private apiUrl = 'http://localhost:3010';


  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/versions`);
  }

  updateRemoteVersions(selectedVersions: any[]): Observable<any> {
    return this.http.put<any[]>(`${this.apiUrl}/updateRemoteVersions`, selectedVersions);
  }

  


  getReleases(): Observable<Release[]> {
    return this.http.get<Release[]>(`${this.apiUrl}/releases`);
  }

  addRelease(release: Release): Observable<Release> {
    return this.http.post<Release>(`${this.apiUrl}/releases`, release);
  }

  updateRelease(release: Release): Observable<Release> {
    return this.http.put<Release>(`${this.apiUrl}/releases/${release.id}`, release);
  }

  deleteRelease(id: number): Observable<Release> {
    return this.http.delete<Release>(`${this.apiUrl}/releases/${id}`);
  }

}