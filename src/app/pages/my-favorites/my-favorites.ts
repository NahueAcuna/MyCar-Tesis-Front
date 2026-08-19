import { Component, OnInit } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { ProfileService } from '../../services/profile-service';
import { Header } from '../../Components/user-layout/header/header';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-favorites',
  imports: [Header, RouterLink, CommonModule],
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites implements OnInit {
  myFavorites: PublicationResponse[] = [];

  constructor(public profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        this.myFavorites = data;
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  // Recibe el evento para frenar la navegación del routerLink
  quitarFavorito(event: Event, id: number) {
    event.stopPropagation(); // Evita que se abra la publicación al hacer clic en el corazón
    
    this.profileService.toggleFavorito(id).subscribe(() => {
      // Recargamos la lista para que la tarjeta desaparezca instantáneamente
      this.cargarFavoritos(); 
    });
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
  }

  descriptionPreview(text: string | undefined) {
    if (!text) {
      return '';
    }
    const words = text?.split(' ');
    let i = 0
    let description: string = '';
    while (i < words?.length && i < 4) {
      description = description + words.at(i) + ' ';
      i++;
    }
    return description.trim() + '...';
  }
}