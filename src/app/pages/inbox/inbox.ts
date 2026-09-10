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
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  miEmail: string = '';
  chats: any[] = [];
  chatSeleccionado: any = null;
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  conversacionIdActual: number = 0;

  private shouldScrollToBottom = false;

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

    this.chatService.mensajes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(historial => {
        this.mensajes = historial;
        this.shouldScrollToBottom = true;
      });
  }

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
    this.chatService.desconectar();

    this.chatSeleccionado = chat;

    chat.cantidadNoLeidos = 0;

    const comprador = chat.rol === 'COMPRADOR' ? this.miEmail : chat.emailContacto;
    const vendedor = chat.rol === 'VENDEDOR' ? this.miEmail : chat.emailContacto;

    this.chatService.obtenerSalaPrivada(chat.publicacionId, comprador, vendedor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sala) => {
          this.conversacionIdActual = sala.conversacionId;
          this.chatService.conectar(this.conversacionIdActual, sala.mensajes);

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

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}

