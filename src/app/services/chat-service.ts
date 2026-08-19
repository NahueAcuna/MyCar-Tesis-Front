import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// 1. Acordate de importar el environment (ajustá la ruta según tu carpeta)
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: CompatClient | null = null;
  private mensajesSubject = new BehaviorSubject<any[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  private mensajesActuales: any[] = [];

  // Contador compartido de mensajes no leídos
  private noLeidosSubject = new BehaviorSubject<number>(0);
  public cantidadNoLeidos$ = this.noLeidosSubject.asObservable();

  // 2. Guardamos la URL base dinámica
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Pedir la sala al backend
  obtenerSalaPrivada(pubId: number, comprador: string, vendedor: string): Observable<any> {
    return this.http.get(`${this.baseUrl}conversacion/iniciar?publicacionId=${pubId}&compradorEmail=${comprador}&vendedorEmail=${vendedor}`);
  }

  // Obtener cantidad de mensajes no leídos
  refrescarContador(email: string): void {
    if (!email) return;
    this.http.get<number>(`${this.baseUrl}conversacion/no-leidos?email=${email}`)
      .subscribe({
        next: (cantidad) => this.noLeidosSubject.next(cantidad),
        error: (err) => console.error('Error al obtener mensajes no leídos', err)
      });
  }

  // Marcar como leídos los mensajes de una conversación
  marcarComoLeidos(conversacionId: number, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}conversacion/marcar-leidos?conversacionId=${conversacionId}&email=${email}`, {});
  }

  // Conectar al canal privado
  conectar(conversacionId: number, historialAntiguo: any[]) {
    this.mensajesActuales = historialAntiguo;
    this.mensajesSubject.next(this.mensajesActuales);

    // 3. ¡SockJS también necesita usar la variable dinámica!
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
}