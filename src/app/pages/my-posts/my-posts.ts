import { Component, OnInit } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { ProfileService } from '../../services/profile-service';
import { Header } from '../../Components/user-layout/header/header';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-my-posts',
  imports: [Header, RouterLink],
  templateUrl: './my-posts.html',
  styleUrl: './my-posts.css',
})
export class MyPosts implements OnInit {
  myPosts: PublicationResponse[] = [];

  constructor(public profileService: ProfileService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.myPost();
  }

  myPost(){
    this.profileService.getMyPosts().subscribe({
      next: (response) => {this.myPosts = response},
      error: (error) => {console.error('Error al obtener mis publicaciones:', error); this.toast.error('Error al obtener mis publicaciones');}
    });
  }

  goBack(){
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