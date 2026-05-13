import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  user: any;
  
  constructor(public authService : AuthService) {
     this.user = this.authService.getUser();
  }
}
