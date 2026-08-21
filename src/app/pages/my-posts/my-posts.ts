import { Component, OnInit } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { ProfileService } from '../../services/profile-service';
import { Header } from '../../Components/user-layout/header/header';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast-service';
import { CommonModule } from '@angular/common';
import { PublicationService } from '../../services/publication-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-posts',
  imports: [Header, RouterLink, CommonModule],
  templateUrl: './my-posts.html',
  styleUrl: './my-posts.css',
})
export class MyPosts implements OnInit {
  myPosts: PublicationResponse[] = [];
  postToDelete: number | null = null;

  constructor(public profileService: ProfileService, public publicationService: PublicationService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.myPost();
  }

  myPost(){
    this.profileService.getMyPosts().subscribe({
      next: (response) => {this.myPosts = response},
      error: (error) => {console.error('Error al obtener mis publicaciones:', error); this.toast.error('Error al obtener mis publicaciones.');}
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

  confirmDelete(id: number) {
    this.postToDelete = id;
  }

  cancelDelete() {
    this.postToDelete = null;
  }

  executeDelete() {
    if (this.postToDelete) {
      this.publicationService.deletePublication(this.postToDelete).subscribe({
        next: (response) => {
          // Filtramos el array para sacar la publicación eliminada al instante sin recargar la página
          this.myPosts = this.myPosts.filter(p => p.id !== this.postToDelete);
          this.postToDelete = null; // Cerramos el modal
          const mensajeExito = 'Publicación eliminada correctamente.';
          this.toast.success(mensajeExito);
        },
        error: (err) => {
          console.error("Error al eliminar la publicación", err);
          this.postToDelete = null;
          this.toast.error('No se pudo eliminar la publicación.');
        }
      });
    }
  }

  editPost(id: number) {
    this.router.navigate(['/editar', id]);
  }
}