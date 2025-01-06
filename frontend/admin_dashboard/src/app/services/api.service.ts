import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreMember } from '../interfaces/core-member';
import { environment } from '../../environments/environment';
import { Edition } from '../interfaces/edition';
import { AvailableTshirt } from '../interfaces/available-tshirt';
import { Tshirt } from '../interfaces/tshirt';
import { Size } from '../interfaces/size';

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
  getCurrentEdition(): Observable<Edition> {
    return this.http.get<Edition>(`${this.baseUrl}/editions/current`);
  }
  
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

  //list all tshirts /tshirts/tshirts
  getAllTshirts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tshirts/tshirts`);
  }

  //list all available tshirts for the current edition /tshirts/available-tshirts/current/
  getAvailableTshirts(): Observable<any> {
    return this.http.get<AvailableTshirt>(`${this.baseUrl}/tshirts/available-tshirts/current/`);
  }

  //add tshirt /tshirts/available_tshirts
  addTshirt(tshirt: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tshirts/available_tshirts`, tshirt);
  }

  //update available tshirt /tshirts/available_tshirts/:id
  updateAvailableTshirt(tshirt: any, id: number): Observable<any> {
    return this.http.patch<AvailableTshirt>(`${this.baseUrl}/tshirts/available_tshirts/${id}`, tshirt);
  }

  //update tshirt /tshirts/available_tshirts/:id
  updateTshirt(tshirt: any, id: number): Observable<any> {
    return this.http.patch<Tshirt>(`${this.baseUrl}/tshirts/tshirts/${id}`, tshirt);
  }

  //delete tshirt /tshirts/available_tshirts/:id
  deleteTshirt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tshirts/available_tshirts/${id}`);
  }

  //delete model /tshirts/tshirts/:id
  deleteModel(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tshirts/tshirts/${id}`);
  }

  //get sizes /api/tshirts/sizes
  getSizes(): Observable<Size[]> {
    return this.http.get<Size[]>(`${this.baseUrl}/tshirts/sizes`);
  }

  //create size /api/tshirts/sizes
  createSize(sizeData: { size: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/tshirts/sizes', sizeData); // Correctly sending the JSON body
  }

  //delete size /api/tshirts/sizes/:size
  deleteSize(size: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tshirts/sizes/${size}`);
  }

  //get sizes by tshirt id /tshirt_sizes/{tshirt_id}/
  getSizesByTshirtId(tshirtId: number): Observable<Size[]> {
    return this.http.get<Size[]>(`${this.baseUrl}/tshirts/tshirt_sizes/${tshirtId}/`);
  }
}
