import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Club } from '../interfaces/club';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  constructor(private httpClient: HttpClient) { }

  getClubById(id: number): Observable<Club> {
    return this.httpClient.get<Club>(`http://localhost:3000/clubs/${id}`);
  }

  putClub(id: number, club: Club): Observable<Club> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    return this.httpClient.put<Club>(`http://localhost:3000/clubs/${id}`, club, { headers: headers });
  }
}
