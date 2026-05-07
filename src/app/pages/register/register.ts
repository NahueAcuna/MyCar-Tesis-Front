import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterRequest } from '../../models/RegisterRequest';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user: RegisterRequest = {
    nombre: '',
    email: '',
    telefono: '',
    password: ''
  };

  constructor(private authService: AuthService) {}

  register(){
    this.authService.register(this.user).subscribe({
      next: (response) => {console.log('Registro exitoso', response); alert('Registro exitoso');},
      error: (error) => {console.error('Error en el registro', error); alert('Error en el registro');}
    });
  }
}
