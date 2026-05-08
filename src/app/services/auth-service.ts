import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../models/RegisterRequest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient) {}

  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.url}/registro`, user);
  }

  // Decodifica el payload del JWT guardado en localStorage
  private getPayload(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getRol(): string {
    const payload = this.getPayload();
    return payload?.rol || payload?.role || payload?.authorities || '';
  }

  isAdmin(): boolean {
    const rol = this.getRol();
    return rol === 'ADMIN' || (Array.isArray(rol) && rol.includes('ADMIN'));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
