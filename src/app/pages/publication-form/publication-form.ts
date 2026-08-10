import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../Components/user-layout/header/header';
import { PublicationService } from '../../services/publication-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-publication-form',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './publication-form.html',
  styleUrl: './publication-form.css'
})
export class PublicationForm {
  mostrarPagina1 = true;
  mostrarPagina2 = false;
  mostrarPagina3 = false;
  mostrarPagina4 = false;

  errorMessage = '';
  campoNumeroError: { [key: string]: boolean } = {};

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
    combustible: '',
    caja: '',
    fotoUrl: 'https://via.placeholder.com/300x200/1a1a1a/ff8c00?text=Vista+Previa',
    imagenes: [] as string[],
    videos: [] as string[]
  };

  selectedFiles: File[] = [];
  selectedVideoFiles: File[] = [];

  constructor(private router: Router, private publicationService: PublicationService, private toast: ToastService) { }

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

  onVideoSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.publicationData.videos = [];
      this.selectedVideoFiles = Array.from(files);
      this.selectedVideoFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.publicationData.videos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  publicarVehiculo() {
    // Verificar si hay token válido antes de intentar el request
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast.warning('Tu sesión expiró. Por favor, iniciá sesión nuevamente.');
      return;
    }

    const publicacionRequestDTO: import('../../models/PublicationRequest').PublicationRequest = {
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
          combustible: this.publicationData.combustible,
          caja: this.publicationData.caja,
          puertas: this.publicationData.puertas ? this.publicationData.puertas.toString() : '4',
          potencia: this.publicationData.caballos ? this.publicationData.caballos.toString() : ''
        },
        imagenesUrl: []
      }
    };

    const todosLosArchivos = [...this.selectedFiles, ...this.selectedVideoFiles];
    this.publicationService.createPublication(publicacionRequestDTO, todosLosArchivos).subscribe({
      next: () => {
        this.toast.success('Publicación creada con éxito!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Ocurrió un error al crear la publicación.');
      }
    });
  }

  // --- Helpers de estandarización ---
  private titleCase(texto: string): string {
    return texto.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  private capitalizarPrimeraLetra(texto: string): string {
    const trimmed = texto.trim();
    if (!trimmed) return trimmed;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  bloquearNumeros(event: KeyboardEvent, campo: string) {
    if (/[0-9]/.test(event.key)) {
      event.preventDefault();
      this.campoNumeroError[campo] = true;
      setTimeout(() => this.campoNumeroError[campo] = false, 2500);
    }
  }

  irAPagina1() {
    this.mostrarPagina1 = true;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = false;
  }

  irAPagina2() {
    if (!this.publicationData.marca.trim() || !this.publicationData.modelo.trim() || !this.publicationData.descripcion.trim()) {
      this.errorMessage = 'Completá todos los campos antes de continuar.';
      return;
    }
    if (this.publicationData.marca.trim().length < 2) {
      this.errorMessage = 'La marca debe tener al menos 2 caracteres.';
      return;
    }
    if (/[0-9]/.test(this.publicationData.marca)) {
      this.errorMessage = 'La marca no puede contener números.';
      return;
    }
    if (this.publicationData.modelo.trim().length < 2) {
      this.errorMessage = 'El modelo debe tener al menos 2 caracteres.';
      return;
    }
    if (this.publicationData.descripcion.trim().length < 10) {
      this.errorMessage = 'La descripción debe tener al menos 10 caracteres.';
      return;
    }
    this.errorMessage = '';
    // Estandarizar textos del paso 1
    this.publicationData.marca = this.titleCase(this.publicationData.marca);
    this.publicationData.modelo = this.titleCase(this.publicationData.modelo);
    this.publicationData.descripcion = this.capitalizarPrimeraLetra(this.publicationData.descripcion);
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = true;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = false;
  }

  irAPagina3() {
    if (!this.publicationData.km.trim() || !this.publicationData.combustible.trim() || !this.publicationData.caja.trim() ||
        !this.publicationData.caballos || !this.publicationData.color.trim() || !this.publicationData.puertas ||
        !this.publicationData.motor.trim() || !this.publicationData.anio) {
      this.errorMessage = 'Completá todos los campos antes de continuar.';
      return;
    }
    
    if (!/^\d+$/.test(this.publicationData.km.trim())) {
      this.errorMessage = 'Los kilómetros deben contener únicamente números.';
      return;
    }

    const currentYear = new Date().getFullYear();
    if (this.publicationData.anio < 1900 || this.publicationData.anio > currentYear + 1) {
      this.errorMessage = `El año debe estar entre 1900 y ${currentYear + 1}.`;
      return;
    }

    if (this.publicationData.caballos <= 0) {
      this.errorMessage = 'Los caballos de fuerza deben ser mayores a 0.';
      return;
    }

    if (this.publicationData.puertas < 2 || this.publicationData.puertas > 6) {
      this.errorMessage = 'La cantidad de puertas debe estar entre 2 y 6.';
      return;
    }

    this.errorMessage = '';
    // Estandarizar textos del paso 2
    this.publicationData.combustible = this.titleCase(this.publicationData.combustible);
    this.publicationData.color = this.titleCase(this.publicationData.color);
    this.publicationData.motor = this.publicationData.motor.trim();
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = true;
    this.mostrarPagina4 = false;
  }

  irAPagina4() {
    if (this.selectedFiles.length === 0 || !this.publicationData.precio) {
      this.errorMessage = 'Subí al menos una foto y completá el precio.';
      return;
    }
    if (this.publicationData.precio <= 0) {
      this.errorMessage = 'El precio debe ser mayor a 0.';
      return;
    }
    this.errorMessage = '';
    this.mostrarPagina1 = false;
    this.mostrarPagina2 = false;
    this.mostrarPagina3 = false;
    this.mostrarPagina4 = true;
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
