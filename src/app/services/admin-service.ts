import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublicationResponse } from '../models/PublicationResponse';
import { ReservaResponse } from '../models/ReservaResponse';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private url = `${environment.apiUrl}publicacion`;
  private reservaUrl = `${environment.apiUrl}reserva`;

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

  // --- Reservas ---

  getReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.reservaUrl}/admin/lista`);
  }

  modificarReserva(reserva: ReservaResponse): Observable<ReservaResponse> {
    return this.http.put<ReservaResponse>(`${this.reservaUrl}/modificar-reserva`, reserva);
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reservaUrl}/${id}`);
  }
}