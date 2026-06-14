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
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22500%22%3E%3Crect%20width%3D%22800%22%20height%3D%22500%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    }

    if (url.startsWith('http')) {
      return url;
    }

    // Para paths locales legacy (ej: /images/uuid.jpg), apuntar al backend
    return 'http://localhost:8080' + url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22500%22%3E%3Crect%20width%3D%22800%22%20height%3D%22500%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null; // Evitar loop infinito si el placeholder también falla
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
        if (err.status === 409) {
          alert('Ya tenés una reserva activa para este vehículo. No podés crear una nueva hasta que la anterior expire o sea cancelada.');
        } else if (err.status === 0) {
          alert('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
        } else {
          alert('Hubo un problema al procesar tu reserva con Mercado Pago. Intentá nuevamente más tarde.');
        }
        this.cargandoPago = false; 
      }
    });
  }
}