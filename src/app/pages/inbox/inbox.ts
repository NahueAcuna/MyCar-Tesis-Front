import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css'
})
export class InboxComponent implements OnInit, OnDestroy {
  miEmail: string = '';
  chats: any[] = [];
  chatSeleccionado: any = null;
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  conversacionIdActual: number = 0;

 
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.miEmail = localStorage.getItem('usuario_email') || '';
    this.cargarMisChats();

    this.chatService.mensajes$.subscribe(historial => {
      this.mensajes = historial;
    });
  }

  ngOnDestroy() {
    this.chatService.desconectar();
  }

  cargarMisChats() {
    if (!this.miEmail) return;
    
    // Le pedimos los datos al servicio en lugar de hacer el fetch acá
    this.chatService.obtenerMisChats(this.miEmail)
      .subscribe({
        next: (data) => {
          this.chats = data;
        },
        error: (err) => console.error('Error al cargar la bandeja', err)
      });
  }

  abrirChat(chat: any) {
    this.chatService.desconectar();
    this.chatSeleccionado = chat;

    const comprador = chat.rol === 'COMPRADOR' ? this.miEmail : chat.emailContacto;
    const vendedor = chat.rol === 'VENDEDOR' ? this.miEmail : chat.emailContacto;

    this.chatService.obtenerSalaPrivada(chat.publicacionId, comprador, vendedor)
      .subscribe({
        next: (sala) => {
          this.conversacionIdActual = sala.conversacionId;
          this.chatService.conectar(this.conversacionIdActual, sala.mensajes);

          this.chatService.marcarComoLeidos(this.conversacionIdActual, this.miEmail)
            .subscribe(() => {
              this.chatService.refrescarContador(this.miEmail);
            });
        },
        error: (err) => console.error("Error al abrir sala", err)
      });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || this.conversacionIdActual === 0) return;
    
    this.chatService.enviarMensaje(this.conversacionIdActual, this.miEmail, this.nuevoMensaje);
    this.nuevoMensaje = '';
  }
}