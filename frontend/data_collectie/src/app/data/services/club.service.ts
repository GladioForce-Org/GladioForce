import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Club } from '../types/club';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// import { environment as prodEnvironment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ClubService {

  private readonly baseUrl = `${environment.apiUrl}/collection`;
  private readonly headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');

  constructor(private readonly httpClient: HttpClient) { }

  getClubById(id: number): Observable<Club> {
    return this.httpClient.get<Club>(`${this.baseUrl}/${id}`);
  }

  getClubByLink(clubLink: string): Observable<Club> {
    return this.httpClient.get<Club>(`${this.baseUrl}/${clubLink}`);
  }

  patchClub(clubLink: string, club: Club): Observable<Club> {
    return this.httpClient.patch<Club>(`${this.baseUrl}/update/${clubLink}`, club, { headers: this.headers });
  }
}
