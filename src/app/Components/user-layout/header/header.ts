import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit{
  constructor(public authService: AuthService, private router: Router) {}
  seccionActiva: string = ''; 
  menuOpen = false;

  ngAfterViewInit() {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {

          this.seccionActiva = entrada.target.id; 
        } else if (entrada.target.id === 'inventory' && !entrada.isIntersecting) {

            this.seccionActiva = '';
        }
      });
    }, {
      threshold: 0.2 
    });

    const seccionAutos = document.getElementById('inventory'); 
    
    if (seccionAutos) observador.observe(seccionAutos);
  }

}
