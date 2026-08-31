import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../models/RegisterRequest';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/LoginRequest';
import { Router } from '@angular/router';
import { User } from '../models/User';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = `${environment.apiUrl}usuario`;

  constructor(private http: HttpClient, public router : Router) {}

  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.url}/registro`, user);
  }

  login(user: LoginRequest): Observable<any> {
    return this.http.post(`${this.url}/login`, user);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
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
    return payload?.rol || payload?.role || payload?.authorities || payload?.authority || '';
  }

  isAdmin(): boolean {
    const rol = this.getRol();
    return rol === 'ADMIN' || rol === 'ROLE_ADMIN' || (Array.isArray(rol) && (rol.includes('ADMIN') || rol.includes('ROLE_ADMIN')));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario_email');
    this.router.navigate(['/login']);
  }

  loginGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.url}/login/google`, {
      idToken
    });
  }

  registroGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.url}/registro/google`, {
      idToken
    });
  }

  // Nuevo recuperar cuenta //
  olvidePassword(email: string): Observable<any> {
    return this.http.post(`${this.url}/olvide-password`, { email });
  }

  restablecerPassword(token: string, nuevaPassword: string): Observable<any> {
    return this.http.post(`${this.url}/restablecer-password`, { token, nuevaPassword });
  }

}
