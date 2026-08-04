import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublicationResponse } from '../models/PublicationResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private url = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) {}

  // Obtener publicaciones pendientes de aprobación
  getPublicacionesPendientes(): Observable<PublicationResponse[]> {
    return this.http.get<PublicationResponse[]>(`${this.url}/admin/pendientes`);
  }

  // Aprobar una publicación
  aprobarPublicacion(id: number): Observable<PublicationResponse> {
    return this.http.patch<PublicationResponse>(`${this.url}/admin/aprobar/${id}`, {});
  }

  // Rechazar una publicación
  rechazarPublicacion(id: number): Observable<any> {
    return this.http.delete(`${this.url}/admin/rechazar/${id}`);
  }

  // Obtener estadísticas para el dashboard
  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.url}/admin/estadisticas`);
  }
}
