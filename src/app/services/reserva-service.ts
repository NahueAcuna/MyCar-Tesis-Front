import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReservaRequest } from '../models/reserva-request';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {


  readonly URL = `${environment.apiUrl}reserva`;

  constructor(private http: HttpClient) {}

  iniciarReserva(reserva: ReservaRequest): Observable<string> {
    
    let headers = new HttpHeaders();
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage
    

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.URL}/crear`, reserva, { 
      headers: headers, 
      responseType: 'text' 
    });
  }
}