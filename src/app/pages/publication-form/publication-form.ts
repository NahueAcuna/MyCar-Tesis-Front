import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';
import { PublicationService } from '../../services/publication-service';

@Component({
  selector: 'app-publication-form',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './publication-form.html',
  styleUrl: './publication-form.css'
})
export class PublicationForm {
  mostrarPagina1 = true;
  mostrarPagina2 = false;
  mostrarPagina3 = false;
  mostrarPagina4 = false;

  publicationData = {
    marca: '',
    modelo: '',
    caballos: null as number | null,
    color: '',
    puertas: null as number | null,
    motor: '',
    anio: null as number | null,
    precio: null as number | null,
    descripcion: '',
    km: '',
    fotoUrl: 'https://via.placeholder.com/300x200/1a1a1a/ff8c00?text=Vista+Previa',
    imagenes: [] as string[]
  };

  selectedFiles: File[] = [];

  constructor(private router: Router, private publicationService: PublicationService) {}

  get currentStep(): number {
    if (this.mostrarPagina1) return 1;
    if (this.mostrarPagina2) return 2;
    if (this.mostrarPagina3) return 3;
    if (this.mostrarPagina4) return 4;
    return 1;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.publicationData.imagenes = [];
      this.selectedFiles = Array.from(files);
      
      this.selectedFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.publicationData.imagenes.push(e.target.result);
          // Set the first image as preview
          if (this.publicationData.imagenes.length === 1) {
            this.publicationData.fotoUrl = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  publicarVehiculo() {
    const publicacionRequestDTO = {
      descripcion: this.publicationData.descripcion || 'Sin descripción',
      auto: {
        marca: this.publicationData.marca,
        modelo: this.publicationData.modelo,
        precio: this.publicationData.precio || 0,
        anio: this.publicationData.anio || 2000,
        km: this.publicationData.km || '0',
        color: this.publicationData.color,
        fichaTecnica: {
          motor: this.publicationData.motor,
          combustible: '',
          caja: '',
          puertas: this.publicationData.puertas || 4,
          potencia: this.publicationData.caballos ? this.publicationData.caballos.toString() : ''
        }
      }
    };

    const formData = new FormData();
    formData.append('publicacion', JSON.stringify(publicacionRequestDTO));
    
    this.selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    this.publicationService.createPublication(formData).subscribe({
      next: () => {
        alert('Publicación creada con éxito!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert('Ocurrió un error al crear la publicación.');
      }
    });
  }

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

  cancelar() {
    this.router.navigate(['/']);
  }
}
