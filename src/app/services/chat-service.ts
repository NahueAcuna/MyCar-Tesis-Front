import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; // <-- Importamos HttpClient

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: CompatClient | null = null;
  private mensajesSubject = new BehaviorSubject<any[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  private mensajesActuales: any[] = [];

  constructor(private http: HttpClient) {} // <-- Lo inyectamos

  // 1. Nuevo método para pedir la sala al backend
  obtenerSalaPrivada(pubId: number, comprador: string, vendedor: string): Observable<any> {
    return this.http.get(`http://localhost:8080/conversacion/iniciar?publicacionId=${pubId}&compradorEmail=${comprador}&vendedorEmail=${vendedor}`);
  }

  // 2. Conectar al canal privado
  conectar(conversacionId: number, historialAntiguo: any[]) {
    // Cargamos el historial previo a la vista
    this.mensajesActuales = historialAntiguo;
    this.mensajesSubject.next(this.mensajesActuales);

    const socket = new SockJS('http://localhost:8080/ws-chat');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, () => {
      // Nos suscribimos a la SALA PRIVADA
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