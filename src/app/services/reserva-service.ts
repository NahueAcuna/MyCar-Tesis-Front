import { HttpClient, HttpHeaders, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReservaRequest } from '../models/reserva-request';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {

  readonly URL = 'http://localhost:8080/reserva'

  constructor(private http:HttpClient, private authService: AuthService) {}

  iniciarReserva(reserva: ReservaRequest): Observable<string> {
    
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    
    // Solo inyectamos el Token si existe (evita mandar "Bearer null")
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.URL}/crear`, reserva, { 
      headers: headers, 
      responseType: 'text' 
    });
  }
}
