import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile-service';
import { Header } from '../../Components/user-layout/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-reservations',
  imports: [Header, RouterLink, CommonModule],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css',
})
export class MyReservations implements OnInit {

  misReservas: any[] = [];

  constructor(private profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    this.myReservation();
  }

   myReservation(){
    this.profileService.getMyReservations().subscribe({
      next: (response) => {this.misReservas = response},
      error: (error) => {
        console.warn('No se pudieron cargar las reservas:', error?.status, error?.message);
        this.misReservas = [];
      }
    });
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

 getImageUrl(url: string): string {
    if (!url){
      return 'assets/no-image.png';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return 'http://localhost:8080' + url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
  }

  goBack() {
    this.router.navigate(['/perfil']);
  }

}
