import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../models/RegisterRequest';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/LoginRequest';
import { Router } from '@angular/router';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient, public router : Router) {}

  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.url}/registro`, user);
  }

  login(user: LoginRequest): Observable<any> {
    return this.http.post(`${this.url}/login`, user);
  }

  saveToken(token: string): void {
    this.setCookie('token', token); // Guardar el token en una cookie con duración de 1 día
  }

  saveUser(user: User): void {
    this.setCookie('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = this.getCookie('user');
    return user ? JSON.parse(user) : null;
  }
  getToken(): string | null {
    return this.getCookie('token');
  }

  saveEmail(email: string): void {
    this.setCookie('usuario_email', email);
  }

  getEmail(): string {
    return this.getCookie('usuario_email') || '';
  }
  
  private getPayload(): any {
    const token = this.getCookie('token');
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
    return !!this.getCookie('token');
  }

  logout(): void {
    this.removeCookie('token');
    this.removeCookie('user');
    this.removeCookie('usuario_email');
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

  // --- MÉTODOS PRIVADOS PARA MANEJAR COOKIES DE SESIÓN ---
  
  private setCookie(name: string, value: string): void {
    // Al no especificar 'expires', se crea como Cookie de Sesión (se borra al cerrar el navegador)
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private removeCookie(name: string): void {
    // Para borrar una cookie, le seteamos una fecha que ya pasó (1970)
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

}
