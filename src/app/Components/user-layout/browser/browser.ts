import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-browser',
  imports: [],
  templateUrl: './browser.html',
  styleUrl: './browser.css',
})
export class Browser implements OnInit{
  // Variables que arrancan en 0
  expCount: number = 0;
  clientesCount: number = 0;

  ngOnInit(): void {
    this.animarContadores();
  }

  animarContadores() {
    const duracion = 2000;

   
    const targetExp = 10;
    const tiempoPasoExp = Math.abs(Math.floor(duracion / targetExp));
    
    const intervaloExp = setInterval(() => {
      this.expCount++;
      if (this.expCount >= targetExp) {
        clearInterval(intervaloExp);
      }
    }, tiempoPasoExp);

    const targetClientes = 430;
    const fotogramas = 60; 
    const tiempoPasoClientes = duracion / fotogramas; 
    const incrementoClientes = Math.ceil(targetClientes / fotogramas); 
    
    let clientesActual = 0;
    const intervaloClientes = setInterval(() => {
      clientesActual += incrementoClientes;
      
      if (clientesActual >= targetClientes) {
        this.clientesCount = targetClientes; 
        clearInterval(intervaloClientes);
      } else {
        this.clientesCount = clientesActual;
      }
    }, tiempoPasoClientes);
  }
}
