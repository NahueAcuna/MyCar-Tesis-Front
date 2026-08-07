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
    const duracion = 2000; // Duración total de la animación en milisegundos (2 segundos)

    // Animación para "Años de experiencia" (0 a 10)
    const targetExp = 10;
    const tiempoPasoExp = Math.abs(Math.floor(duracion / targetExp));
    
    const intervaloExp = setInterval(() => {
      this.expCount++;
      if (this.expCount >= targetExp) {
        clearInterval(intervaloExp);
      }
    }, tiempoPasoExp);

    // Animación para "Clientes Satisfechos" (0 a 430)
    // Como 430 es un número más grande, sumamos de a "saltos" más grandes para que termine a tiempo
    const targetClientes = 430;
    const fotogramas = 60; // Cantidad de veces que se actualizará el número en los 2 segundos
    const tiempoPasoClientes = duracion / fotogramas; 
    const incrementoClientes = Math.ceil(targetClientes / fotogramas); 
    
    let clientesActual = 0;
    const intervaloClientes = setInterval(() => {
      clientesActual += incrementoClientes;
      
      if (clientesActual >= targetClientes) {
        this.clientesCount = targetClientes; // Nos aseguramos de que termine exacto en 430
        clearInterval(intervaloClientes);
      } else {
        this.clientesCount = clientesActual;
      }
    }, tiempoPasoClientes);
  }
}
