import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { environment } from '../../environments/environment';

/**
 * Servicio global de notificaciones en tiempo real.
 *
 * Estrategia dual:
 * 1. WebSocket STOMP al canal personal `/user/{email}/queue/notifications`
 *    para push instantáneo (si el backend lo soporta).
 * 2. Polling HTTP cada 30s como fallback — se auto-desactiva si el WS está activo.
 *
 * El servicio es singleton (`providedIn: 'root'`) y mantiene una única conexión
 * WebSocket durante toda la sesión del usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {

  // ── Estado reactivo ──────────────────────────────────────────────────
  private readonly noLeidosSubject = new BehaviorSubject<number>(0);
  public readonly contadorNoLeidos$ = this.noLeidosSubject.asObservable();

  private readonly notificacionSubject = new Subject<any>();
  public readonly notificacion$ = this.notificacionSubject.asObservable();

  // ── Conexión STOMP ───────────────────────────────────────────────────
  private stompClient: CompatClient | null = null;
  private wsConectado = false;

  // ── Polling fallback ─────────────────────────────────────────────────
  private pollingSub: Subscription | null = null;
  private readonly destroy$ = new Subject<void>();

  // ── Config ───────────────────────────────────────────────────────────
  private readonly baseUrl = environment.apiUrl;
  private emailUsuario = '';

  constructor(private http: HttpClient) {}

  /**
   * Inicializa el servicio para un usuario autenticado.
   * Refresca el contador inicial y abre la conexión WebSocket + polling.
   * Es idempotente: si ya está inicializado para el mismo email, no hace nada.
   */
  init(email: string): void {
    if (!email || this.emailUsuario === email) return;
    this.emailUsuario = email;

    // Carga inicial del contador vía HTTP
    this.refrescarContador(email);

    // Intentar conexión WebSocket
    this.conectarWebSocket(email);

    // Activar polling como fallback
    this.iniciarPolling(email);
  }

  /**
   * Obtiene el contador actualizado de mensajes no leídos vía HTTP.
   */
  refrescarContador(email: string): void {
    if (!email) return;
    this.http.get<number>(`${this.baseUrl}conversacion/no-leidos?email=${email}`)
      .subscribe({
        next: (cantidad) => this.noLeidosSubject.next(cantidad),
        error: (err) => console.error('Error al obtener mensajes no leídos', err)
      });
  }

  /**
   * Marca como leídos los mensajes de una conversación y refresca el contador.
   */
  marcarComoLeidos(conversacionId: number, email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}conversacion/marcar-leidos?conversacionId=${conversacionId}&email=${email}`,
      {}
    );
  }

  /**
   * Intenta establecer conexión STOMP al canal personal de notificaciones.
   * Si el backend no soporta el canal, la conexión se cierra silenciosamente.
   */
  private conectarWebSocket(email: string): void {
    try {
      const socket = new SockJS(`${this.baseUrl}ws-chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        this.wsConectado = true;

        // Desactivar polling si WS conectó exitosamente
        this.detenerPolling();

        // Suscripción al canal personal de notificaciones
        this.stompClient?.subscribe(`/user/${email}/queue/notifications`, (frame: any) => {
          try {
            const notificacion = JSON.parse(frame.body);
            this.notificacionSubject.next(notificacion);

            // Incrementar el contador localmente para feedback instantáneo
            const actual = this.noLeidosSubject.getValue();
            this.noLeidosSubject.next(actual + 1);
          } catch (e) {
            // Si el body no es JSON válido, refrescar vía HTTP como fallback
            this.refrescarContador(this.emailUsuario);
          }
        });
      }, () => {
        // Error de conexión STOMP — polling queda como mecanismo principal
        this.wsConectado = false;
      });
    } catch (e) {
      // SockJS no disponible o URL inválida — polling como fallback
      this.wsConectado = false;
    }
  }

  /**
   * Inicia polling HTTP cada 30 segundos.
   * Se auto-desactiva si la conexión WebSocket está activa.
   */
  private iniciarPolling(email: string): void {
    this.detenerPolling();

    this.pollingSub = timer(30_000, 30_000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.http.get<number>(
          `${this.baseUrl}conversacion/no-leidos?email=${email}`
        ))
      )
      .subscribe({
        next: (cantidad) => {
          // Solo actualizar si WS no está activo (evitar conflictos)
          if (!this.wsConectado) {
            this.noLeidosSubject.next(cantidad);
          }
        },
        error: () => {
          // Silenciar errores de polling — no es crítico
        }
      });
  }

  /**
   * Detiene el polling HTTP.
   */
  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
  }

  /**
   * Desconecta la conexión WebSocket y detiene el polling.
   */
  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect();
    }
    this.stompClient = null;
    this.wsConectado = false;
    this.detenerPolling();
    this.emailUsuario = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
