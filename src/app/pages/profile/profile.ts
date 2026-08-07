import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Header } from '../../Components/user-layout/header/header';
import { User } from '../../models/User';
import { ProfileService } from '../../services/profile-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [Header, RouterLink, FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  user: User | null = null;
  myPosts: PublicationResponse[] = [];
  myReservations: any[] = [];
  showAllPosts: boolean = false;
  isEditModalOpen: boolean = false;

  constructor(public authService : AuthService, public profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.myPost();
    this.myReservation();
  }

  myPost(){
    this.profileService.getMyPosts().subscribe({
      next: (response) => {this.myPosts = response},
      error: (error) => {console.error('Error al obtener mis publicaciones:', error); alert('Error al obtener mis publicaciones');}
    });
  }
  
  irChats(){
    this.router.navigate(['chats'])
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
            alert('Error al actualizar: ' + (error.error || 'Ocurrió un problema inesperado.'));
          }
        });
      }else{
        this.closeEditModal();
      }
    }
  }
}
