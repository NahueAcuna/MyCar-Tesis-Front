import { Component } from '@angular/core';
import { Header } from '../../Components/user-layout/header/header';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [Header, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm : FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private fb : FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
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
}
