import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { Header } from '../../Components/user-layout/header/header';
import { ToastService } from '../../services/toast-service';
declare const google: any;

@Component({
  selector: 'app-register',
  imports: [Header, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit{

  registerForm : FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private fb : FormBuilder, private router: Router, private toast: ToastService) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '835687169998-4ocdeolb8vrd12a3tq5j9cvn4cdg0h61.apps.googleusercontent.com',
        callback: (response: any) => {
          this.registroGoogle(response.credential);
        }
      });
    }
  }

  get nombre(){
    return this.registerForm.get('nombre');
  }

  get email(){
    return this.registerForm.get('email');
  }

  get telefono(){
    return this.registerForm.get('telefono');
  }

  get password(){
    return this.registerForm.get('password');
  }

  register(){
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {console.log('Registro exitoso', response); this.toast.success('Registro exitoso'); this.router.navigate(['/perfil']);},
      error: (error) => {console.error(error);
        if(error.status === 409){
          this.toast.error(error.error);
        }else{
          this.toast.error('Error en el registro');
        }
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  registroConGoogle() {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      this.toast.warning('El servicio de Google no está disponible en este momento.');
    }
  }

  registroGoogle(idToken: string) {
    this.authService.registroGoogle(idToken)
      .subscribe({

        next: (response) => {

          this.authService.saveToken(response.token);

          this.authService.saveUser({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
            telefono: response.telefono
          });

          localStorage.setItem('usuario_email', response.email);

          this.toast.success('Registro con Google exitoso');

          this.router.navigate(['/']);
        },

        error: (error) => {

          console.error(error);

          if(error.status === 409){
            this.toast.error('Ya existe una cuenta registrada con ese Google');
          }else{
            this.toast.error('Error al registrarse con Google');
          }
        }
      });
  }
}
