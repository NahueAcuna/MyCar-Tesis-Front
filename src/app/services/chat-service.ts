import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Servicio dedicado exclusivamente a la gestión de un chat activo.
 *
 * Responsabilidades:
 * - Obtener/crear sala de conversación privada.
 * - Conectar/desconectar del canal STOMP de un chat específico.
 * - Enviar y recibir mensajes en tiempo real.
 * - Obtener la lista de chats del usuario.
 *
 * La lógica de notificaciones y contadores se maneja en NotificationService.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: CompatClient | null = null;
  private mensajesSubject = new BehaviorSubject<any[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  private mensajesActuales: any[] = [];

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Pedir la sala al backend */
  obtenerSalaPrivada(pubId: number, comprador: string, vendedor: string): Observable<any> {
    return this.http.get(`${this.baseUrl}conversacion/iniciar?publicacionId=${pubId}&compradorEmail=${comprador}&vendedorEmail=${vendedor}`);
  }

  /** Conectar al canal privado de un chat específico */
  conectar(conversacionId: number, historialAntiguo: any[]) {
    this.mensajesActuales = historialAntiguo;
    this.mensajesSubject.next(this.mensajesActuales);

    const socket = new SockJS(`${this.baseUrl}ws-chat`);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, () => {
      this.stompClient?.subscribe(`/topic/chat/${conversacionId}`, (sdkEvent: any) => {
        const mensajeRecibido = JSON.parse(sdkEvent.body);
        this.mensajesActuales = [...this.mensajesActuales, mensajeRecibido];
        this.mensajesSubject.next(this.mensajesActuales);
      });
    });
  }

  enviarMensaje(conversacionId: number, remitenteEmail: string, contenido: string) {
    const mensaje = { remitenteEmail, contenido };
    this.stompClient?.send(`/app/chat/${conversacionId}`, {}, JSON.stringify(mensaje));
  }

  desconectar() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect();
    }
    this.mensajesActuales = [];
    this.mensajesSubject.next([]);
  }

  obtenerMisChats(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}conversacion/mis-chats?emailUsuario=${email}`);
  }
}