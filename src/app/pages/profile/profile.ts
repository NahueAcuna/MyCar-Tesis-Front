import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Header } from '../../Components/user-layout/header/header';
import { User } from '../../models/User';
import { ProfileService } from '../../services/profile-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [Header, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  user: User | null = null;
  myPosts: PublicationResponse[] = [];
  myReservations: any[] = [];
  showAllPosts: boolean = false;

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
