import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private url = 'http://localhost:8080/publicacion';
  private url2 = 'http://localhost:8080/reserva';

  constructor(private http: HttpClient) {}

  getMyPosts(): Observable<any> {
    return this.http.get(`${this.url}/misPublicaciones`);
  }

  getMyReservations(): Observable<any> {
    return this.http.get(`${this.url2}/mis-reservas`);
  }
}
