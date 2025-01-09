import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Club } from '../interfaces/club';
import { Volunteer } from '../interfaces/volunteer';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  private baseUrl = environment.apiUrl + '/collection/';

  constructor(private httpClient: HttpClient) { }

  getClubById(id: number): Observable<Club> {
    return this.httpClient.get<Club>(`${this.baseUrl}${id}`);
  }

  getClubByLink(link: string): Observable<Club> {
    return this.httpClient.get<Club>(`${this.baseUrl}${link}`);
  }

  patchClub(link: string, club: Club): Observable<Club> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    return this.httpClient.patch<Club>(`${this.baseUrl}update/${link}`, club, { headers: headers });
  }

  getVolunteersByClubLink(link: string): Observable<Volunteer[]> {
    return this.httpClient.get<Volunteer[]>(`${this.baseUrl}`+'volunteers/'+`${link}`);
  }


  //time registration endpoints

  
}
