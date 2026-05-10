import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerForm : FormGroup;

  constructor(private authService: AuthService, private fb : FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
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
      next: (response) => {console.log('Registro exitoso', response); alert('Registro exitoso');},
      error: (error) => {console.error(error);
        if(error.status === 409){
          alert('El email ya está registrado');
        }else{
          alert('Error en el registro');
        }
      }
    });

    this.registerForm.reset();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
