import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private url = `${environment.apiUrl}publicacion`;
  private url2 = `${environment.apiUrl}reserva`;
  private url3 = `${environment.apiUrl}usuario`;

  constructor(private http: HttpClient) {}

  getMyPosts(): Observable<any> {
    return this.http.get(`${this.url}/misPublicaciones`);
  }

  getMyReservations(): Observable<any> {
    return this.http.get(`${this.url2}/mis-reservas`);
  }

  updateEmail(id: number, newEmail: string): Observable<any> {
    return this.http.put(`${this.url3}/${id}`, { email: newEmail });
  }

  completePhone(email: string, telefono: string): Observable<any> {
    return this.http.post(`${this.url3}/completar-telefono?email=${email}&telefono=${telefono}`, {});
  }

  toggleFavorito(idPublicacion: number): Observable<any> {
    return this.http.post(`${this.url3}/favoritos/${idPublicacion}`, {});
  }

  getFavoritos(): Observable<any> {
    return this.http.get(`${this.url3}/favoritos`);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.url3}/cuenta`);  
  }
}
