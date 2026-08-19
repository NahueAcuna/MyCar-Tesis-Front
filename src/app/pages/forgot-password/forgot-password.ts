import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService, private toast: ToastService, private router: Router){}

  enviarCorreo() {
    if (!this.email) {
      this.toast.warning('Por favor, ingresá tu email.');
      return;
    }

    this.cargando = true;
    this.authService.olvidePassword(this.email).subscribe({
      next: (response) => {
        this.cargando = false;
        this.toast.success(response.mensaje || 'Si el correo está registrado, recibirás un enlace.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.cargando = false;
        // Mostramos éxito igual por seguridad (para no revelar qué correos existen)
        this.toast.success('Si el correo está registrado, recibirás un enlace.');
        this.router.navigate(['/login']);
      }
    });
  }
}
