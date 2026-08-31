import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../Components/user-layout/header/header';
import { AdminService } from '../../services/admin-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { ReservaResponse } from '../../models/ReservaResponse';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-gestion-admin',
  imports: [CommonModule, FormsModule, Header, BaseChartDirective, RouterLink],
  templateUrl: './gestion-admin.html',
  styleUrl: './gestion-admin.css'
})
export class GestionAdmin implements OnInit {

  tabActivo: 'dashboard' | 'publicaciones' | 'reservas' = 'dashboard';

  publicacionesPendientes: PublicationResponse[] = [];
  cargando = false;
  error = '';

  // Metrics
  totalPendientes: number = 0;
  totalConcesionaria: number = 0;
  totalComunidad: number = 0;
  
  // Charts
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Concesionaria', 'Comunidad'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#c57839', '#5c3917'],
      hoverBackgroundColor: ['#FF7F0E', '#8b5118']
    }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'white'
        }
      }
    }
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Publicaciones por Marca', backgroundColor: '#FF7F0E', borderRadius: 5 }
    ]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'white', stepSize: 1 }
      },
      x: {
        ticks: { color: 'white' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // --- Reservas ---
  reservas: ReservaResponse[] = [];
  filtroEstado: string = 'TODAS';
  cargandoReservas = false;
  errorReservas = '';

  constructor(
    private adminService: AdminService, 
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: 'dashboard' | 'publicaciones' | 'reservas') {
    this.tabActivo = tab;
    if (tab === 'reservas' && this.reservas.length === 0) {
      this.cargarReservas();
    }
  }

  cargarDatos() {
    this.cargando = true;
    this.error = '';

    forkJoin({
      pendientes: this.adminService.getPublicacionesPendientes(),
      estadisticas: this.adminService.getEstadisticas()
    }).subscribe({
      next: (res) => {
        // Pendientes data
        this.publicacionesPendientes = res.pendientes;
        
        // Use stats from backend
        const stats = res.estadisticas;
        this.totalPendientes = stats.pendientes || 0;
        this.totalConcesionaria = stats.concesionaria || 0;
        this.totalComunidad = stats.usuario || 0;

        // Update Pie Chart
        this.pieChartData.datasets[0].data = [this.totalConcesionaria, this.totalComunidad];
        
        // Update Bar Chart (Top Marcas)
        if (stats.topMarcas) {
          const marcas = Object.keys(stats.topMarcas);
          const counts = Object.values(stats.topMarcas) as number[];
          this.barChartData.labels = marcas;
          this.barChartData.datasets[0].data = counts;
        }

        // Force chart update assignment hack for ng2-charts change detection
        this.pieChartData = { ...this.pieChartData };
        this.barChartData = { ...this.barChartData };

        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los datos del sistema.';
        this.cargando = false;
      }
    });
  }

  aprobar(id: number) {
    this.adminService.aprobarPublicacion(id).subscribe({
      next: () => {
        this.publicacionesPendientes = this.publicacionesPendientes.filter(p => p.id !== id);
        this.toast.success('Publicación aprobada correctamente');
      },
      error: () => this.toast.error('Error al aprobar la publicación.')
    });
  }

  rechazar(id: number) {
    this.adminService.rechazarPublicacion(id).subscribe({
      next: () => {
        this.publicacionesPendientes = this.publicacionesPendientes.filter(p => p.id !== id);
        this.toast.success('Publicación rechazada correctamente');
      },
      error: () => this.toast.error('Error al rechazar la publicación.')
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

  // --- Reservas ---

  cargarReservas() {
    this.cargandoReservas = true;
    this.errorReservas = '';

    this.adminService.getReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.cargandoReservas = false;
      },
      error: () => {
        this.errorReservas = 'Error al cargar las reservas.';
        this.cargandoReservas = false;
      }
    });
  }

  get reservasFiltradas(): ReservaResponse[] {
    if (this.filtroEstado === 'TODAS') {
      return this.reservas;
    }
    return this.reservas.filter(r => r.estadoReserva === this.filtroEstado);
  }

  cambiarEstadoReserva(reserva: ReservaResponse, nuevoEstado: 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA') {
    const reservaModificada: ReservaResponse = { ...reserva, estadoReserva: nuevoEstado };

    this.adminService.modificarReserva(reservaModificada).subscribe({
      next: (actualizada) => {
        const index = this.reservas.findIndex(r => r.id === reserva.id);
        if (index !== -1) {
          this.reservas[index] = actualizada;
        }
        this.toast.success(`Reserva #${reserva.id} actualizada a ${nuevoEstado}`);
      },
      error: () => this.toast.error('Error al modificar la reserva.')
    });
  }

  eliminarReserva(reserva: ReservaResponse) {
    if (!confirm(`¿Estás seguro de eliminar la reserva #${reserva.id} de ${reserva.usuarioReserva?.nombre || reserva.usuarioReserva?.email}?`)) {
      return;
    }

    this.adminService.eliminarReserva(reserva.id).subscribe({
      next: () => {
        this.reservas = this.reservas.filter(r => r.id !== reserva.id);
        this.toast.success(`Reserva #${reserva.id} eliminada`);
      },
      error: () => this.toast.error('Error al eliminar la reserva.')
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'ACEPTADA': return 'badge-aceptada';
      case 'CANCELADA': return 'badge-cancelada';
      default: return '';
    }
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
