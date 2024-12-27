import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreMember } from '../interfaces/core-member';
import { environment } from '../../environments/environment';
import { Edition } from '../interfaces/edition';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  // auth
  testAuth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth`);
  }

  // coreMemberApi
  createCoreMember(coreMember: CoreMember): Observable<CoreMember> {
    return this.http.post<CoreMember>(`${this.baseUrl}/coremembers/`, coreMember);
  }

  getAllCoreMembers(): Observable<CoreMember[]> {
    return this.http.get<CoreMember[]>(`${this.baseUrl}/coremembers/`);
  }

  getCoreMember(id: number): Observable<CoreMember> {
    return this.http.get<CoreMember>(`${this.baseUrl}/coremembers/${id}`);
  }

  updateCoreMember(id: number, coreMember: CoreMember): Observable<CoreMember> {
    return this.http.put<CoreMember>(`${this.baseUrl}/coremembers/${id}`, coreMember);
  }

  deleteCoreMember(id: number): Observable<CoreMember> {
    return this.http.delete<CoreMember>(`${this.baseUrl}/coremembers/${id}`);
  }

  // editionApi
  createEdition(edition: Edition): Observable<Edition> {
    return this.http.post<Edition>(`${this.baseUrl}/editions/`, edition);
  }

  getAllEditions(): Observable<Edition[]> {
    return this.http.get<Edition[]>(`${this.baseUrl}/editions/`);
  }

  deleteEdition(id: number): Observable<Edition> {
    return this.http.delete<Edition>(`${this.baseUrl}/editions/${id}`);
  }

  editEdition(id: number, edition: Edition): Observable<Edition> {
    return this.http.patch<Edition>(`${this.baseUrl}/editions/${id}`, edition);
  }

  // calls for tshirts

}
