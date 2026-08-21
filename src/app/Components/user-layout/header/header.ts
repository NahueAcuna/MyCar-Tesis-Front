import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit, OnInit, OnDestroy{
  constructor(
    public authService: AuthService,
    private router: Router,
    public chatService: ChatService
  ) {}
  
  seccionActiva: string = ''; 
  menuOpen = false;
  cantidadNoLeidos: number = 0;
  private noLeidosSub?: Subscription;

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const email = localStorage.getItem('usuario_email') || '';
      if (email) {
        this.chatService.refrescarContador(email);
      }
      this.noLeidosSub = this.chatService.cantidadNoLeidos$.subscribe(
        cantidad => this.cantidadNoLeidos = cantidad
      );
    }
  }

  ngOnDestroy() {
    this.noLeidosSub?.unsubscribe();
  }

  ngAfterViewInit() {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {

          this.seccionActiva = entrada.target.id; 
        } else if (entrada.target.id === 'inventory' && !entrada.isIntersecting) {

            this.seccionActiva = '';
        }
      });
    }, {
      threshold: 0.2 
    });

    const seccionAutos = document.getElementById('inventory'); 
    
    if (seccionAutos) observador.observe(seccionAutos);
  }
}
