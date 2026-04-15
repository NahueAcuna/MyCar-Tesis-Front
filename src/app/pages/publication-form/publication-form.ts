import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publication-form',
  imports: [CommonModule],
  templateUrl: './publication-form.html',
  styleUrl: './publication-form.css'
})
export class PublicationForm {
  mostrarPagina1 = true;
  mostrarPagina2 = false;
  mostrarPagina3 = false;
  mostrarPagina4 = false;

  irAPagina1() {
    this.mostrarPagina1 = true;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = false;
  }

  irAPagina2() {
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = true;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = false;
  }

  irAPagina3() {
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = true;
    this.mostrarPagina4 = false;
  }

  irAPagina4() {
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = true;
  }
}
