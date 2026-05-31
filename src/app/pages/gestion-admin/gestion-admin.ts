import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { AdminService } from '../../services/admin-service';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-gestion-admin',
  imports: [CommonModule, Header, Footer, BaseChartDirective],
  templateUrl: './gestion-admin.html',
  styleUrl: './gestion-admin.css'
})
export class GestionAdmin implements OnInit {

  // Tab activo: 'dashboard', 'publicaciones' o 'reservas'
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

  constructor(
    private adminService: AdminService, 
    private publicationService: PublicationService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: 'dashboard' | 'publicaciones' | 'reservas') {
    this.tabActivo = tab;
  }

  cargarDatos() {
    this.cargando = true;
    this.error = '';

    forkJoin({
      pendientes: this.adminService.getPublicacionesPendientes(),
      concesionaria: this.publicationService.getPublications(),
      comunidad: this.publicationService.getUserPublications()
    }).subscribe({
      next: (res) => {
        // Pendientes data
        this.publicacionesPendientes = res.pendientes;
        this.totalPendientes = res.pendientes.length;

        // Dashboard metrics
        this.totalConcesionaria = res.concesionaria.length;
        this.totalComunidad = res.comunidad.length;

        // Update Pie Chart
        this.pieChartData.datasets[0].data = [this.totalConcesionaria, this.totalComunidad];
        
        // Update Bar Chart (Top Marcas)
        const allApproved = [...res.concesionaria, ...res.comunidad];
        const marcaCounts: { [key: string]: number } = {};
        allApproved.forEach(pub => {
          let marca = pub.auto.marca.trim();
          marca = marca.charAt(0).toUpperCase() + marca.slice(1).toLowerCase();
          marcaCounts[marca] = (marcaCounts[marca] || 0) + 1;
        });

        const sortedMarcas = Object.keys(marcaCounts).sort((a, b) => marcaCounts[b] - marcaCounts[a]).slice(0, 5);
        this.barChartData.labels = sortedMarcas;
        this.barChartData.datasets[0].data = sortedMarcas.map(marca => marcaCounts[marca]);

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
