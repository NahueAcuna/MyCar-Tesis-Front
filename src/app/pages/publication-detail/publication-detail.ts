import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { CommonModule, Location } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { ReservaService } from '../../services/reserva-service';
import { ReservaRequest } from '../../models/reserva-request';

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
  
  // Variable para controlar el estado del botón de pago
  cargandoPago: boolean = false;

  constructor(
    public publicationService: PublicationService,
    private reservaService: ReservaService, 
    private route: ActivatedRoute, 
    public router: Router, 
    private location: Location
  ) { }

  ngOnInit(): void {
    const idPublication = this.route.snapshot.params['id']
    this.getPublicationById(idPublication);
  }

  onMouseMove(event: MouseEvent) {
    const element = event.target as HTMLElement;
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

    if (url.startsWith('http')) {
      return url;
    }

    return 'http://localhost:8080' + url;
  }

  pagarReserva() {
    const emailUsuarioLogueado = localStorage.getItem('usuario_email');

    if (!emailUsuarioLogueado) {
      console.log('Usuario no registrado. Abriendo flujo de invitado...');
      alert('Por favor, iniciá sesión o completá tus datos para poder reservar este auto.');
      return; 
    }

    this.cargandoPago = true;
    const idActual = Number(this.route.snapshot.params['id']);

    // 1. Generamos la fecha actual en el formato exacto que pide Java
    const fechaParaJava = new Date().toISOString().substring(0, 19);

    // 2. Armamos el paquete sumando la fecha
    const reservaRequest: ReservaRequest = {
      idPublicacion: idActual,
      fecha: fechaParaJava,         // <-- ¡ESTA LÍNEA ES LA CLAVE QUE FALTABA!
      usuarioReservaDTO: {
        nombre: 'Sin nombre',       // Texto por defecto para evitar nulos
        email: emailUsuarioLogueado, 
        telefono: '0000'            // Texto por defecto para evitar nulos
      }
    };

    // 3. Disparamos la petición
    this.reservaService.iniciarReserva(reservaRequest).subscribe({
      next: (urlMercadoPago: string) => {
        window.location.href = urlMercadoPago;
      },
      error: (err) => {
        console.error('Error al generar el link de pago:', err);
        alert('Hubo un problema al procesar tu reserva con Mercado Pago.');
        this.cargandoPago = false; 
      }
    });
  }
}