import { Component, ElementRef, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publication-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { ProfileService } from '../../services/profile-service';


@Component({
  selector: 'app-marketplace',
  imports: [CommonModule,ReactiveFormsModule,Header],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css',
})
export class Marketplace {

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 1000000;

  misFavoritosIds: number[] = [];

  // --- VARIABLES DE PAGINACIÓN ---
  currentPage: number = 1; // Cambiado a 1 para que arranque en la primer página
  itemsPerPage: number = 6;

  // --- GETTERS DE PAGINACIÓN ---
  get totalPages(): number {
    return Math.ceil(this.filteredPublications.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  @ViewChild('searchInput') searchInput!: ElementRef;

  filtersForm: FormGroup;

  made: FormControl;
  model: FormControl;
  anio: FormControl;
  minPrice: FormControl;
  maxPrice: FormControl;
  minKm: FormControl;
  maxKm: FormControl;

  constructor(private publicationService: PublicationService, public router: Router, private profileService: ProfileService) {
    this.made = new FormControl('');
    this.model = new FormControl('');
    this.anio = new FormControl('');
    this.minPrice = new FormControl(0);
    this.maxPrice = new FormControl(1000000);
    this.minKm = new FormControl('');
    this.maxKm = new FormControl('');

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
       anio: this.anio,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minKm: this.minKm,
      maxKm: this.maxKm
    });
  }

  ngOnInit(): void {
    this.getPublications();
    this.cargarFavoritos();
  }

  getPublications() {
    this.publicationService.getUserPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.filteredPublications = data;
        
        data.forEach(p => {
          // Si la marca NO está en el arreglo, la agrego
          if (!this.mades.includes(p.auto.marca)) {
            this.mades.push(p.auto.marca);
          }
          
          // Si el modelo NO está en el arreglo, lo agrego
          if (!this.models.includes(p.auto.modelo)) {
            this.models.push(p.auto.modelo);
          }
        });
      }
    });
  }

  descriptionPreview(text: string | undefined) {
    if (!text) {
      return '';
    }
    const words = text?.split(' ');
    let i = 0
    let description: string = '';
    while (i < words?.length && i < 4) {
      description = description + words.at(i) + ' ';
      i++;
    }
    return description.trim() + '...';
  }

  switchSearchView() {
    this.isSearchShowed = !this.isSearchShowed;

    if (this.isSearchShowed) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  carDetail(id: number) {
    this.router.navigate(['publicacion', id]);
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase().trim();

    if (!query) {
      this.filteredPublications = [...this.publications];
      this.currentPage = 1; // Volvemos a la página 1
      return;
    }

    this.filteredPublications = this.publications.filter(pub => {
      const fullAutoName = `${pub.auto.marca} ${pub.auto.modelo}`.toLowerCase();
      return fullAutoName.includes(query);
    });
    
    this.currentPage = 1; // Volvemos a la página 1 al buscar
  }

  actualizarMinimo(event: any) {
    this.precioMinimo = Number(event.target.value);
  }

  actualizarMaximo(event: any) {
    this.precioMaximo = Number(event.target.value);
  }

  applyFilters() {
    const filters = this.filtersForm.value;

    this.filteredPublications = this.publications.filter(p => {
      const car = p.auto;

      if (filters.made && car.marca.toLowerCase() !== filters.made.toLowerCase()) {
        return false;
      }

      if (filters.model && car.modelo.toLowerCase() !== filters.model.toLowerCase()) {
        return false;
      }

      if (filters.minPrice != null && car.precio < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice != null && car.precio > filters.maxPrice) {
        return false;
      }

      if (filters.minKm != null && car.km < filters.minKm) {
        return false;
      }

      if (filters.maxKm != null && filters.maxKm != "" && car.km > filters.maxKm) {
        return false;
      }
      return true;
    });
    
    this.currentPage = 1; // Volvemos a la página 1 al filtrar
  }

  filterCleaner() {
    this.filtersForm.reset({
      made: '',
      model: '',
      minPrice: 0,
      maxPrice: 1000000,
      minKm: '',
      maxKm: ''
    });
    this.filteredPublications = [...this.publications];
    this.currentPage = 1; // Volvemos a la página 1 al limpiar
  }

  // --- FUNCIONES DE BOTONES DE PAGINACIÓN ---
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getImageUrl(url: string): string {
    if (!url){
      return 'assets/no-image.png';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return 'http://localhost:8080' + url;
  }

// --- MÉTODOS DE FAVORITOS ---
  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        // Guardamos solo los IDs para hacer la validación más rápida en el HTML
        this.misFavoritosIds = data.map((pub: any) => Number(pub.id));
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  toggleFavorito(idPublicacion: number) {
    const id = Number(idPublicacion);
    // 1. Guardamos el estado actual (si ya era favorito o no)
    const yaEraFavorito = this.misFavoritosIds.includes(id);

    // 2. ACTUALIZACIÓN INSTANTÁNEA (Obligamos a Angular a repintar)
    if (yaEraFavorito) {
      this.misFavoritosIds = this.misFavoritosIds.filter(id => id !== idPublicacion);
    } else {
      // En vez de .push(), recreamos el array. Esto dispara el cambio en el HTML al toque.
      this.misFavoritosIds = [...this.misFavoritosIds, idPublicacion];
    }

    // 3. Mandamos la petición al backend en segundo plano
    this.profileService.toggleFavorito(idPublicacion).subscribe({
      next: () => {
        console.log("Favorito guardado en BD con éxito");
      },
      error: (err) => {
        console.error("Error al modificar favorito, revirtiendo color...", err);
        // Si el backend falla, volvemos el corazón a su estado original
        if (yaEraFavorito) {
          this.misFavoritosIds = [...this.misFavoritosIds, idPublicacion];
        } else {
          this.misFavoritosIds = this.misFavoritosIds.filter(id => id !== idPublicacion);
        }
      }
    });
  }

  // Nueva función súper segura para el HTML
  esFavorito(idPub: any): boolean {
    return this.misFavoritosIds.includes(Number(idPub));
  }
}
