import { Component, OnInit } from '@angular/core';
import { Header } from '../../Components/user-layout/header/header';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
declare const google: any;

@Component({
  selector: 'app-login',
  imports: [Header, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  loginForm : FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private fb : FormBuilder, private router: Router) {
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
        this.authService.saveToken(response.token);
        this.authService.saveUser({
          id: response.id,
          nombre: response.nombre,
          email: response.email,
          rol: response.rol
        });
        localStorage.setItem('usuario_email', response.email);
        alert('Login exitoso');
        this.router.navigate(['/']);  
      },
      error: (error) => {console.error(error);
        if(error.status === 401){
          alert('Email o contraseña incorrectos');
        }else{
          alert('Error al iniciar sesión.');
        }
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  loginConGoogle() {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      alert('El servicio de Google no está disponible. Intentá recargar la página.');
      return;
    }
    // Re-inicializamos siempre para garantizar que client_id esté configurado
    this.initGoogleSignIn();
    google.accounts.id.prompt();
  }

  loginGoogle(idToken: string) {
    this.authService.loginGoogle(idToken)
      .subscribe({

        next: (response) => {

          this.authService.saveToken(response.token);

          this.authService.saveUser({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol
          });

          localStorage.setItem('usuario_email', response.email);

          alert('Login con Google exitoso');

          this.router.navigate(['/']);
        },

        error: (error) => {

          console.error(error);

          if(error.status === 404){
            alert('No existe una cuenta registrada con Google');
          }else{
            alert('Error al iniciar sesión con Google');
          }
        }
      });
  }

}
