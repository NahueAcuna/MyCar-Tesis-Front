import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { CommonModule, Location } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';

@Component({
  selector: 'app-publication-detail',
  imports: [CommonModule, Header, Footer],
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css',
})
export class PublicationDetail implements OnInit {

  publicationSelected!: PublicationResponse;
  selectedImage: string = '';
  selectedIsVideo: boolean = false;
  transformStyle: string = 'scale(1)';
  transformOrigin: string = 'center';

  constructor(public publicationService: PublicationService, private route: ActivatedRoute, public router: Router, private location: Location) { }

  ngOnInit(): void {
    const idPublication = this.route.snapshot.params['id']
    this.getPublicationById(idPublication);
  }

  onMouseMove(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.transformOrigin = `${x}% ${y}%`;
    this.transformStyle = 'scale(1.8)';
  }

  onMouseLeave() {
    this.transformStyle = 'scale(1)';
    this.transformOrigin = 'center';
  }

  goBack() {
    this.location.back();
  }

  getPublicationById(id: string){
    this.publicationService.getPublicationById(id).subscribe({
      next: (data) => {
        this.publicationSelected = data;
        const imagenes = data.auto.imagenesUrl || [];
        const videos = data.auto.videosUrl || [];
        const primero = imagenes[0] || videos[0] || '';
        this.selectedImage = primero;
        this.selectedIsVideo = this.isVideo(primero);
      },
      error: () => alert('Se produjo un error al mostrar la lista de publicaciones.')
    })
  }

  isVideo(url: string): boolean {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  }

  get todasLasMedia(): string[] {
    if (!this.publicationSelected) return [];
    const imagenes = this.publicationSelected.auto.imagenesUrl || [];
    const videos = this.publicationSelected.auto.videosUrl || [];
    return [...imagenes, ...videos];
  }

  seleccionarMedia(url: string) {
    this.selectedImage = url;
    this.selectedIsVideo = this.isVideo(url);
  }

  getImageUrl(url: string): string {

  if (!url) {
    return 'assets/no-image.png';
  }

  // si es una imagen externa
  if (url.startsWith('http')) {
    return url;
  }

  // si es una imagen local del backend
  return 'http://localhost:8080' + url;
}
}
