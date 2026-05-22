import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { AdminService } from '../../services/admin-service';
import { PublicationResponse } from '../../models/PublicationResponse';

@Component({
  selector: 'app-gestion-admin',
  imports: [CommonModule, Header, Footer],
  templateUrl: './gestion-admin.html',
  styleUrl: './gestion-admin.css'
})
export class GestionAdmin implements OnInit {

  // Tab activo: 'publicaciones' o 'reservas'
  tabActivo: 'publicaciones' | 'reservas' = 'publicaciones';

  publicacionesPendientes: PublicationResponse[] = [];
  cargando = false;
  error = '';

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cambiarTab(tab: 'publicaciones' | 'reservas') {
    this.tabActivo = tab;
  }

  cargarPendientes() {
    this.cargando = true;
    this.error = '';
    this.adminService.getPublicacionesPendientes().subscribe({
      next: (data) => {
        this.publicacionesPendientes = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las publicaciones pendientes.';
        this.cargando = false;
      }
    });
  }

  aprobar(id: number) {
    this.adminService.aprobarPublicacion(id).subscribe({
      next: () => {
        this.publicacionesPendientes = this.publicacionesPendientes.filter(p => p.id !== id);
      },
      error: () => alert('Error al aprobar la publicación.')
    });
  }

  rechazar(id: number) {
    this.adminService.rechazarPublicacion(id).subscribe({
      next: () => {
        this.publicacionesPendientes = this.publicacionesPendientes.filter(p => p.id !== id);
      },
      error: () => alert('Error al rechazar la publicación.')
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/publicacion', id]);
  }

  getImageUrl(url: string): string {
    if (!url) {
      return 'assets/no-image.png';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return 'http://localhost:8080' + url;
  }
}
