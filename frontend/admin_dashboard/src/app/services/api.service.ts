import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreMember } from '../interfaces/core-member';
import { environment } from '../../environments/environment';

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
}
