import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
export class PublicationForm implements OnInit {
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

  editMode = false;
  publicationId: number | null = null;

  constructor(private router: Router, private publicationService: PublicationService, private toast: ToastService, private route: ActivatedRoute) { }

  ngOnInit(): void{
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.publicationId = Number(id);
        this.cargarDatosEdicion(this.publicationId);
      }
    });
  }

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
      const nuevosArchivos = Array.from(files) as File[];
      
      // Acumulamos los nuevos archivos junto con los que ya estaban seleccionados
      this.selectedFiles = [...this.selectedFiles, ...nuevosArchivos];

      nuevosArchivos.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Agregamos la previsualización al array visual sin borrar las anteriores
          this.publicationData.imagenes.push(e.target.result);
          
          // Si no hay foto principal o era el placeholder, seteamos esta como vista previa principal
          if (!this.publicationData.fotoUrl || this.publicationData.fotoUrl.includes('placeholder')) {
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
      const nuevosVideos = Array.from(files) as File[];
      
      // Acumulamos los nuevos videos con los anteriores
      this.selectedVideoFiles = [...this.selectedVideoFiles, ...nuevosVideos];

      nuevosVideos.forEach((file: File) => {
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

    const fotosViejasQueQuedan = this.publicationData.imagenes.filter(url => url.startsWith('http'));
    const videosViejosQueQuedan = this.publicationData.videos.filter(url => url.startsWith('http'));

    const urlsQueSeMantienen = [...fotosViejasQueQuedan, ...videosViejosQueQuedan];

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
        imagenesUrl: urlsQueSeMantienen 
      }
    };

    const todosLosArchivos = [...this.selectedFiles, ...this.selectedVideoFiles];

    if (this.editMode && this.publicationId) {
      this.publicationService.updatePublication(this.publicationId, publicacionRequestDTO, todosLosArchivos).subscribe({
        next: () => {
          this.toast.success('Publicación actualizada correctamente!');
          this.router.navigate(['/mis-publicaciones']);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al actualizar la publicación.');
        }
      });
    } else {
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
    const tieneFotos = this.selectedFiles.length > 0 || this.publicationData.imagenes.length > 0;

    if (!tieneFotos || !this.publicationData.precio) {
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

  cargarDatosEdicion(id: number) {
    this.publicationService.getPublicationById(id.toString()).subscribe({
      next: (data: any) => {
        const imagenesReales: string[] = [];
        const videosReales: string[] = [];

        // Filtramos y separamos las URLs
        (data.auto.imagenesUrl || []).forEach((url: any) => {
          if (!url) return;
          const urlStr = String(url).trim();
          if (urlStr === '' || urlStr === 'null' || urlStr === 'undefined' || urlStr === 'http://localhost:8080') return;

          const urlCompleta = urlStr.startsWith('http') ? urlStr : 'http://localhost:8080' + (urlStr.startsWith('/') ? '' : '/') + urlStr;

          // Verificamos si la URL es de un video por su extensión
          const urlMinuscula = urlCompleta.toLowerCase();
          if (urlMinuscula.endsWith('.mp4') || urlMinuscula.endsWith('.webm') || urlMinuscula.endsWith('.mov')) {
            videosReales.push(urlCompleta); // Lo mandamos al array de videos
          } else {
            imagenesReales.push(urlCompleta); // Lo mandamos al array de imágenes
          }
        });

        this.publicationData = {
          marca: data.auto.marca,
          modelo: data.auto.modelo,
          caballos: Number(data.auto.fichaTecnica?.potencia || 0),
          color: data.auto.color,
          puertas: Number(data.auto.fichaTecnica?.puertas || 4),
          motor: data.auto.fichaTecnica?.motor || '',
          anio: data.auto.anio,
          precio: data.auto.precio,
          descripcion: data.descripcion,
          km: data.auto.km,
          combustible: data.auto.fichaTecnica?.combustible || '',
          caja: data.auto.fichaTecnica?.caja || '',
          fotoUrl: imagenesReales.length > 0 ? imagenesReales[0] : 'https://via.placeholder.com/300x200/1a1a1a/ff8c00?text=Vista+Previa',
          imagenes: imagenesReales, // Acá van solo las fotos
          videos: videosReales      // Acá van solo los videos
        };
      }
    });
  }
}
