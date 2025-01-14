import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TimeService {
  private baseUrl = environment.apiUrl + '/register';
  constructor(private httpClient: HttpClient) { }


  // available club for current editon /available_clubs
  getAvailableClubs(): any {
    return this.httpClient.get(`${this.baseUrl}/available_clubs`);
  }

  //get all volunteers for a club "/club/{club_id}/volunteers"
  getVolunteersByClubId(club_id: number): any {
    return this.httpClient.get(`${this.baseUrl}/${club_id}/volunteers`);
  }

  getVolunteerByClubIdAndVolunteerId(club_id: number, volunteer_id: number): any {
    return this.httpClient.get(`${this.baseUrl}/${club_id}/volunteer/${volunteer_id}`);
  }

  // make time registration for a volunteer for current edition /time_registration/{volunteer_id}
  makeTimeRegistration(volunteer_id: number, data: any): any {
    return this.httpClient.post(`${this.baseUrl}/time_registration/${volunteer_id}`, data);
  }
  
  // get a count of all time registrations for a volunteer for current  /time_registrations_count/{volunteer_id}
  getTimeRegistrationsCount(volunteer_id: number): any {
    return this.httpClient.get(`${this.baseUrl}/time_registrations_count/${volunteer_id}`);
  }
}
