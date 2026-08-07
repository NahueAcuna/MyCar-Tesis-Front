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

  goBack() {
    this.router.navigate(['/perfil']);
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