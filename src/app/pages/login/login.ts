import { Component, OnInit } from '@angular/core';
import { Header } from '../../Components/user-layout/header/header';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast-service';
declare const google: any;

@Component({
  selector: 'app-login',
  imports: [Header, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  loginForm : FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private fb : FormBuilder, private router: Router, private toast: ToastService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  private readonly GOOGLE_CLIENT_ID = '835687169998-4ocdeolb8vrd12a3tq5j9cvn4cdg0h61.apps.googleusercontent.com';

  ngOnInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          this.loginGoogle(response.credential);
        }
      });
    }
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }

  login(){
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nombre: response.nombre,
          email: response.email,
          rol: response.rol,
          telefono: response.telefono
        }));
        localStorage.setItem('usuario_email', response.email);
        this.toast.success('Inicio de sesión exitoso.');
        this.router.navigate(['/']);  
      },
      error: (error) => {console.error(error);
        if(error.status === 401){
          this.toast.error('Email o contraseña incorrectos.');
        }else{
          this.toast.error('Error al iniciar sesión.');
        }
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  loginConGoogle() {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      this.toast.warning('El servicio de Google no está disponible. Intentá recargar la página.');
      return;
    }
    this.initGoogleSignIn();
    google.accounts.id.prompt();
  }

  loginGoogle(idToken: string) {
    this.authService.loginGoogle(idToken)
      .subscribe({

        next: (response) => {

          localStorage.setItem('token', response.token);

          localStorage.setItem('user', JSON.stringify({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
            telefono: response.telefono
          }));

          localStorage.setItem('usuario_email', response.email);

          this.toast.success('Inicio de sesión con Google exitoso.');

          this.router.navigate(['/']);
        },

        error: (error) => {

          console.error(error);

          if(error.status === 404){
            this.toast.error('No existe una cuenta registrada con esa cuenta de Google.');
          }else{
            this.toast.error('Error al iniciar sesión con Google.');
          }
        }
      });
  }

}
