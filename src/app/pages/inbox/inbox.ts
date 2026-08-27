import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { ChatService } from '../../services/chat-service';
import { NotificationService } from '../../services/notification-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css'
})
export class InboxComponent implements OnInit, OnDestroy, AfterViewChecked {

  // ── Referencia al contenedor de mensajes para auto-scroll ────────────
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  // ── Estado del componente ────────────────────────────────────────────
  miEmail: string = '';
  chats: any[] = [];
  chatSeleccionado: any = null;
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  conversacionIdActual: number = 0;

  // ── Control de auto-scroll ───────────────────────────────────────────
  // Flag que se activa cuando llegan mensajes nuevos.
  // AfterViewChecked solo ejecuta el scroll si este flag está en true,
  // evitando re-renderizados innecesarios en cada ciclo de detección de cambios.
  private shouldScrollToBottom = false;

  // ── Teardown de suscripciones ────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.miEmail = localStorage.getItem('usuario_email') || '';
    this.cargarMisChats();

    // Suscripción a mensajes en tiempo real con teardown automático
    this.chatService.mensajes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(historial => {
        this.mensajes = historial;
        this.shouldScrollToBottom = true;
      });
  }

  /**
   * Hook del ciclo de vida que se ejecuta después de cada verificación de la vista.
   * Solo hace scroll si el flag está activo — esto es crítico para no degradar
   * el rendimiento con scrolls en cada ciclo de detección de cambios.
   */
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.desconectar();
  }

  cargarMisChats(): void {
    if (!this.miEmail) return;

    this.http.get<any[]>(`${this.baseUrl}conversacion/mis-chats?emailUsuario=${this.miEmail}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chats = data;
        },
        error: (err) => console.error('Error al cargar la bandeja', err)
      });
  }

  abrirChat(chat: any): void {
    // Si ya estábamos en un chat, lo desconectamos para no mezclar canales
    this.chatService.desconectar();

    this.chatSeleccionado = chat;

    // Resetear el contador de no leídos localmente (feedback visual inmediato)
    chat.cantidadNoLeidos = 0;

    // Determinamos los roles para pasárselos al backend
    const comprador = chat.rol === 'COMPRADOR' ? this.miEmail : chat.emailContacto;
    const vendedor = chat.rol === 'VENDEDOR' ? this.miEmail : chat.emailContacto;

    // Pedimos el historial y abrimos el socket
    this.chatService.obtenerSalaPrivada(chat.publicacionId, comprador, vendedor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sala) => {
          this.conversacionIdActual = sala.conversacionId;
          this.chatService.conectar(this.conversacionIdActual, sala.mensajes);

          // Marcar como leídos vía NotificationService y refrescar el contador
          this.notificationService.marcarComoLeidos(this.conversacionIdActual, this.miEmail)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.notificationService.refrescarContador(this.miEmail);
            });
        },
        error: (err) => console.error('Error al abrir sala', err)
      });
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || this.conversacionIdActual === 0) return;

    this.chatService.enviarMensaje(this.conversacionIdActual, this.miEmail, this.nuevoMensaje);
    this.nuevoMensaje = '';
  }

  /**
   * Desplaza el contenedor de mensajes hasta el final.
   * Usa scrollTop directo (no scrollIntoView) para no afectar al scroll global de la página.
   */
  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}

