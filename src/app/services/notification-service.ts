import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {

  private readonly noLeidosSubject = new BehaviorSubject<number>(0);
  public readonly contadorNoLeidos$ = this.noLeidosSubject.asObservable();

  private readonly notificacionSubject = new Subject<any>();
  public readonly notificacion$ = this.notificacionSubject.asObservable();

  private stompClient: CompatClient | null = null;
  private wsConectado = false;

  private pollingSub: Subscription | null = null;
  private readonly destroy$ = new Subject<void>();

  private readonly baseUrl = environment.apiUrl;
  private emailUsuario = '';

  constructor(private http: HttpClient) {}

  init(email: string): void {
    if (!email || this.emailUsuario === email) return;
    this.emailUsuario = email;

    this.refrescarContador(email);

    this.conectarWebSocket(email);

    this.iniciarPolling(email);
  }

  refrescarContador(email: string): void {
    if (!email) return;
    this.http.get<number>(`${this.baseUrl}conversacion/no-leidos?email=${email}`)
      .subscribe({
        next: (cantidad) => this.noLeidosSubject.next(cantidad),
        error: (err) => console.error('Error al obtener mensajes no leídos', err)
      });
  }

  marcarComoLeidos(conversacionId: number, email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}conversacion/marcar-leidos?conversacionId=${conversacionId}&email=${email}`,
      {}
    );
  }

  private conectarWebSocket(email: string): void {
    try {
      const socket = new SockJS(`${this.baseUrl}ws-chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        this.wsConectado = true;

        this.detenerPolling();

        this.stompClient?.subscribe(`/user/${email}/queue/notifications`, (frame: any) => {
          try {
              const notificacion = JSON.parse(frame.body);
              this.notificacionSubject.next(notificacion);

              const actual = this.noLeidosSubject.getValue();
              this.noLeidosSubject.next(actual + 1);
          } catch (e) {
              this.refrescarContador(this.emailUsuario);
          }
        });
      }, () => {
        this.wsConectado = false;
      });
    } catch (e) {
      this.wsConectado = false;
    }
  }

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
          if (!this.wsConectado) {
            this.noLeidosSubject.next(cantidad);
          }
        },
        error: () => {
        }
      });
  }

  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
  }

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
