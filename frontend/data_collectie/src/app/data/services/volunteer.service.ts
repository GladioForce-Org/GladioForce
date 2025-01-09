import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Volunteer } from '../types/volunteer';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {

  private readonly baseUrl = `${environment.apiUrl}/collection`;
  private readonly headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');

  constructor(private readonly httpClient: HttpClient) { }

  getVolunteersByClubLink(clubLink: string): Observable<Volunteer[]> {
    return this.httpClient.get<Volunteer[]>(`${this.baseUrl}/volunteers/${clubLink}`);
  }

  postVolunteer(clubLink: string, volunteer: Volunteer): Observable<Volunteer> {
    console.log('Posting volunteer:', volunteer, 'to club:', clubLink);
    return this.httpClient.post<Volunteer>(
      `${this.baseUrl}/${clubLink}`,
      volunteer,
      { headers: this.headers }
    ).pipe(
      tap(response => console.log('Server response:', response))
    );
  }

  patchVolunteer(clubLink: string, volunteer: Volunteer): Observable<any> {
    return this.httpClient.patch(
      `${this.baseUrl}/update/${clubLink}/volunteer/${volunteer.id}`,
      volunteer,
      { headers: this.headers }
    );
  }

  deleteVolunteer(clubLink: string, volunteerId: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/${clubLink}/volunteer/${volunteerId}`);
  }
}
