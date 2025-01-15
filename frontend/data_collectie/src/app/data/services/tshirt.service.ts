import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailableTshirt } from '../types/available_tshirt';
import { Size } from '../types/size';

@Injectable({
  providedIn: 'root'
})
export class TshirtService {

  private readonly baseUrl = `${environment.apiUrl}/register`;
  private readonly headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');

  constructor(private readonly httpClient: HttpClient) { }

  getAvailableTshirtsCurrentEdition(): Observable<AvailableTshirt[]> {
    return this.httpClient.get<AvailableTshirt[]>(`${this.baseUrl}/available-tshirts/current/`);
  }

  getSizes(): Observable<Size[]> {
    return this.httpClient.get<Size[]>(`${this.baseUrl}/sizes`);
  }
}
