import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { NotificationService } from '../../../services/notification-service';
import { ToastService } from '../../../services/toast-service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit, OnInit, OnDestroy {

  seccionActiva: string = '';
  menuOpen = false;
  cantidadNoLeidos: number = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const email = localStorage.getItem('usuario_email') || '';
      if (email) {
        // Inicializa el servicio global de notificaciones (WebSocket + polling)
        this.notificationService.init(email);
      }

      // Suscripción al contador de no leídos con teardown automático
      this.notificationService.contadorNoLeidos$
        .pipe(takeUntil(this.destroy$))
        .subscribe(cantidad => this.cantidadNoLeidos = cantidad);

      // Suscripción a notificaciones push para mostrar toast
      this.notificationService.notificacion$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.toastService.info('Tenés un nuevo mensaje 💬');
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
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

