import { Component, OnInit, OnDestroy } from '@angular/core'; // <-- Sumamos OnDestroy
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { CommonModule, Location } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { ReservaService } from '../../services/reserva-service';
import { ReservaRequest } from '../../models/reserva-request';
import { FormsModule } from '@angular/forms'; // <-- Sumamos FormsModule para el chat
import { ChatService } from '../../services/chat-service';
import { ToastService } from '../../services/toast-service';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-publication-detail',
  imports: [CommonModule, Header, Footer, FormsModule], // <-- Lo inyectamos acá
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css',
})
export class PublicationDetail implements OnInit, OnDestroy { // <-- Implementamos OnDestroy

  publicationSelected!: PublicationResponse;
  selectedImage: string = '';
  selectedIsVideo: boolean = false;
  transformStyle: string = 'scale(1)';
  transformOrigin: string = 'center';
  cargandoPago: boolean = false;

  // --- VARIABLES DEL CHAT ---
  listaDeMensajes: any[] = [];
  nuevoMensaje: string = '';
  emailUsuarioActual: string = '';
  conversacionIdActual: number = 0;

  constructor(
    public publicationService: PublicationService,
    private reservaService: ReservaService, 
    private chatService: ChatService, // <-- Inyectamos el ChatService
    private route: ActivatedRoute, 
    public router: Router, 
    private location: Location,
    private toast: ToastService,
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    const idPublication = this.route.snapshot.params['id'];
    this.getPublicationById(idPublication);

    // Recuperamos el email del usuario logueado (si no hay, le ponemos Invitado)
    this.emailUsuarioActual = localStorage.getItem('usuario_email') || 'invitado@mail.com';
    
    // Escuchamos los mensajes en tiempo real para pintar el HTML
    this.chatService.mensajes$.subscribe(mensajes => {
      this.listaDeMensajes = mensajes;
      });
  }

  irAChats() {
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Tiene que estar registrado en la página.');
      this.router.navigate(['/login']);
      return; 
    }
    
    const idActual = Number(this.route.snapshot.params['id']);
    
    // 🔥 ACÁ APLICAMOS LA CORRECCIÓN DEL EMAIL 🔥
    // Usamos el emailVendedor que te pedí que agregues al DTO del backend
    const emailDelVendedor = this.publicationSelected.emailVendedor; 

    // Si por algún motivo no hay email, frenamos
    if (!emailDelVendedor) {
      this.toast.error("No se pudo obtener el contacto del vendedor.");
      return;
    }

    // Le pedimos al backend que cree o busque la sala
    this.chatService.obtenerSalaPrivada(idActual, this.emailUsuarioActual, emailDelVendedor)
      .subscribe({
        next: (respuestaSala) => {
          // La sala ya existe en la base de datos de Spring Boot.
          // Ahora sí, lo mandamos a la bandeja de entrada.
          this.router.navigate(['/chats']);
        },
        error: (err) => {
          console.error("Error al crear sala de chat", err);
          this.toast.error("Hubo un problema al intentar contactar al vendedor.");
        }
      });
  }

  // Desconectamos el socket al salir del detalle del auto
  ngOnDestroy(): void {
    this.chatService.desconectar();
  }

  // --- FUNCIÓN PARA ENVIAR EL MENSAJE ---
   enviarMensajeChat() {
    if (!this.nuevoMensaje.trim() || this.conversacionIdActual === 0) return; 
    
    // Mandamos el mensaje a la sala privada
    this.chatService.enviarMensaje(this.conversacionIdActual, this.emailUsuarioActual, this.nuevoMensaje);
    this.nuevoMensaje = ''; 
  }

  // ... (Dejamos intactas las demás funciones que ya tenías: onMouseMove, onMouseLeave, goBack, getPublicationById, isVideo, todasLasMedia, seleccionarMedia, getImageUrl, onImageError, pagarReserva) ...

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

  
  getPublicationById(id: string){
    this.publicationService.getPublicationById(id).subscribe({
      next: (data) => {
        this.publicationSelected = data;
        const imagenes = data.auto.imagenesUrl || [];
        const videos = data.auto.videosUrl || [];
        this.selectedImage = imagenes[0] || videos[0] || '';
        this.selectedIsVideo = this.isVideo(this.selectedImage);
      },
      error: () => this.toast.error('Se produjo un error al mostrar el auto.')
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
    return 'http://localhost:8080' + url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22500%22%3E%3Crect%20width%3D%22800%22%20height%3D%22500%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
  }

  pagarReserva() {
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Tiene que estar registrado en la página.');
      return; 
    }

    this.cargandoPago = true;
    const emailUsuarioLogueado = localStorage.getItem('usuario_email') || '';
    const idActual = Number(this.route.snapshot.params['id']);
    const fechaParaJava = new Date().toISOString().substring(0, 19);

    const reservaRequest: ReservaRequest = {
      idPublicacion: idActual,
      fecha: fechaParaJava,
      usuarioReservaDTO: {
        nombre: 'Sin nombre',
        email: emailUsuarioLogueado, 
        telefono: '0000'
      }
    };

    this.reservaService.iniciarReserva(reservaRequest).subscribe({
      next: (urlMercadoPago: string) => {
        window.location.href = urlMercadoPago;
      },
      error: (err) => {
        if (err.status === 409) {
          this.toast.warning('Ya tenés una reserva activa para este vehículo.');
        } else if (err.status === 0) {
          this.toast.error('No se pudo conectar con el servidor.');
        } else {
          this.toast.error('Hubo un problema al procesar tu reserva.');
        }
        this.cargandoPago = false; 
      }
    });
  }
}