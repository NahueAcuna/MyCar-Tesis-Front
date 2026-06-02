import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Header } from '../../Components/user-layout/header/header';
import { User } from '../../models/User';
import { ProfileService } from '../../services/profile-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [Header, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  user: User | null = null;
  myPosts: PublicationResponse[] = [];
  myReservations: any[] = [];
  showAllPosts: boolean = false;
  isEditModalOpen: boolean = false;

  constructor(public authService : AuthService, public profileService: ProfileService) {}

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

  myReservation(){
    this.profileService.getMyReservations().subscribe({
      next: (response) => {this.myReservations = response},
      error: (error) => {console.error('Error al obtener mis reservas:', error); alert('Error al obtener mis reservas');}
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
