import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile-service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 1000000;

  // --- ARRAY DE FAVORITOS ---
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
  minPrice: FormControl;
  maxPrice: FormControl;
  minKm: FormControl;
  maxKm: FormControl;

  constructor(private publicationService: PublicationService, public router: Router, public profileService: ProfileService) {
    this.made = new FormControl('');
    this.model = new FormControl('');
    this.minPrice = new FormControl(0);
    this.maxPrice = new FormControl(1000000);
    this.minKm = new FormControl('');
    this.maxKm = new FormControl('');

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
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
    this.publicationService.getPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.filteredPublications = data;
        data.forEach(p => {
          this.mades.push(p.auto.marca);
          this.models.push(p.auto.modelo);
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

  getImageUrl(url: string): string {
    if (!url) return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8080' + url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
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
    const url = this.router.serializeUrl(this.router.createUrlTree(['publicacion', id]));
    window.open(url, '_blank');
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

  // --- LÓGICA DE FAVORITOS ---
  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        this.misFavoritosIds = data.map((pub: any) => Number(pub.id));
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  toggleFavorito(idPublicacion: any) {
    const id = Number(idPublicacion);
    const yaEraFavorito = this.misFavoritosIds.includes(id);

    if (yaEraFavorito) {
      this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
    } else {
      this.misFavoritosIds = [...this.misFavoritosIds, id];
    }

    this.profileService.toggleFavorito(id).subscribe({
      next: () => console.log("¡Favorito actualizado en la BD!"),
      error: (err) => {
        console.error("Error al modificar favorito, revirtiendo...", err);
        if (yaEraFavorito) {
          this.misFavoritosIds = [...this.misFavoritosIds, id];
        } else {
          this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
        }
      }
    });
  }

  esFavorito(idPublicacion: any): boolean {
    return this.misFavoritosIds.includes(Number(idPublicacion));
  }

}