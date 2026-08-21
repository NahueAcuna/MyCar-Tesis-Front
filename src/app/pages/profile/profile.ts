import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Header } from '../../Components/user-layout/header/header';
import { User } from '../../models/User';
import { ProfileService } from '../../services/profile-service';
import { ChatService } from '../../services/chat-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [Header, RouterLink, FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy{

  user: User | null = null;
  myPosts: PublicationResponse[] = [];
  myReservations: any[] = [];
  showAllPosts: boolean = false;
  isEditModalOpen: boolean = false;
  showCompleteProfileModal = false;
  telefono = '';
  myFavorites: PublicationResponse[] = [];
  cantidadNoLeidos: number = 0;
  private noLeidosSub?: Subscription;
  showDeleteAccountModal: boolean = false;
  showPosts: boolean = false;
  showReservations: boolean = false;
  showFavorites: boolean = false;

  constructor(
    public authService: AuthService,
    public profileService: ProfileService,
    private router: Router,
    private toast: ToastService,
    public chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if(this.user && !this.user.telefono){
      console.log('Usuario sin teléfono, asignando valor vacío');
      this.showCompleteProfileModal = true;
    }
    this.myPost();
    this.myReservation();
    this.cargarFavoritos();

    // Suscripción al contador de mensajes no leídos
    const email = localStorage.getItem('usuario_email') || '';
    if (email) {
      this.chatService.refrescarContador(email);
    }
    this.noLeidosSub = this.chatService.cantidadNoLeidos$.subscribe(
      cantidad => this.cantidadNoLeidos = cantidad
    );
  }

  ngOnDestroy() {
    this.noLeidosSub?.unsubscribe();
  }

  myPost(){
    this.profileService.getMyPosts().subscribe({
      next: (response) => {this.myPosts = response},
      error: (error) => {console.error('Error al obtener mis publicaciones:', error); this.toast.error('Error al obtener mis publicaciones.');}
    });
  }
  
  irChats(){
    this.router.navigate(['/chats'])
  }

  myReservation(){
    this.profileService.getMyReservations().subscribe({
      next: (response) => {this.myReservations = response},
      error: (error) => {
        // Error silencioso: no mostramos alert para no interrumpir la navegación
        // ni disparar la cadena de logout del interceptor
        console.warn('No se pudieron cargar las reservas:', error?.status, error?.message);
        this.myReservations = [];
      }
    });
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

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'Sin fecha';
    try {
      const d = new Date(fecha);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  }

  openEditModal() {
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  editProfile(nuevoEmail: string) {
    if(this.user && this.user.id){
      if(nuevoEmail && nuevoEmail.trim() !== '' && nuevoEmail !== this.user.email){
        this.profileService.updateEmail(this.user.id, nuevoEmail).subscribe({
          next: (response) => {
            this.closeEditModal();
            this.user!.email = response.email;
            localStorage.setItem('user', JSON.stringify(response));
            localStorage.setItem('token', response.token);
          },
          error: (error) => {
            console.error('Error al actualizar el perfil:', error);
            this.toast.error('Error al actualizar: ' + (error.error || 'Ocurrió un problema inesperado.'));
          }
        });
      }else{
        this.closeEditModal();
      }
    }
  }

 savePhone() {
  if (!/^[0-9]{10}$/.test(this.telefono)) {
    this.toast.warning("El teléfono debe tener exactamente 10 dígitos.");
    return;
  }

  this.profileService.completePhone(this.user!.email, this.telefono)
    .subscribe({
      next: () => {

        this.user!.telefono = this.telefono;

        localStorage.setItem('user', JSON.stringify(this.user!));

        this.showCompleteProfileModal = false;

        this.toast.success("Perfil actualizado correctamente.");
      },

      error: (error) => {
        if(error.status === 409){
          this.toast.error("Ese número de teléfono ya está registrado.");
        }else{
          this.toast.error("Error al guardar el teléfono.");
        }
      }
    });
  }
  
  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        this.myFavorites = data;
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  // Método para cuando el usuario hace clic en el corazón desde su propio perfil
  quitarFavorito(id: number) {
    this.profileService.toggleFavorito(id).subscribe(() => {
      // Recargamos la lista para que desaparezca la tarjeta instantáneamente
      this.cargarFavoritos(); 
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
  }

  // Abre el cartel
  openDeleteAccountModal() {
    this.showDeleteAccountModal = true;
  }

  // Cierra el cartel sin hacer nada
  closeDeleteAccountModal() {
    this.showDeleteAccountModal = false;
  }

  // Se ejecuta SOLO cuando aprietan "Aceptar" en el cartel verde
  confirmarEliminarCuenta() {
    if (this.user) {
      this.profileService.deleteAccount().subscribe({
        next: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('usuario_email');
          this.toast.success("Cuenta eliminada correctamente.");
          this.closeDeleteAccountModal();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error("Error al eliminar la cuenta:", error);
          this.toast.error("Error al eliminar la cuenta.");
          this.closeDeleteAccountModal();
        }
      });
    }
  }
}