import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private toast: ToastService, private router: Router) {}

  ngOnInit() {
   
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.toast.error('Enlace de recuperación inválido.');
        this.router.navigate(['/login']);
      }
    });
  }

  cambiarPassword() {
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.toast.warning('Las contraseñas no coinciden.');
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.toast.warning('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.authService.restablecerPassword(this.token, this.nuevaPassword).subscribe({
      next: (response) => {
        this.toast.success('Contraseña actualizada correctamente. Ya podés iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toast.error(error.error || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
      }
    });
  }
}
